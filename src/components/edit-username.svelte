<script lang="ts">
	import { useToast } from '$lib/use-toast';
	import LoginWithGoogle from '@components/login-with-google.svelte';
	import { useUser } from '$lib/user-user';
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { auth } from '$lib/firebase';
	import { useDebounce } from '$lib/use-debounce';
	import type { FormEventHandler } from 'svelte/elements';
	import { usernameAvailable } from '$lib/username';

	const user = useUser();
	const toast = useToast();

	let available: boolean | null = null;

	const checkUsername = useDebounce<FormEventHandler<HTMLInputElement>>(async (event) => {
		const inputElement = event.target as HTMLInputElement;

		const username = inputElement.value;

		if (!$user) {
			throw 'Not logged in!';
		}

		if (!username || username === $user.username) {
			available = null;
			return;
		}

		available = await usernameAvailable(username);
	}, 500);

	const updateProfile: SubmitFunction = async ({ formData }) => {
		const currentUser = auth.currentUser;

		if (!currentUser) {
			throw 'Not logged in!';
		}

		const idToken = await currentUser.getIdToken();

		formData.append('idToken', idToken);

		return async ({ result }) => {
			switch (result.type) {
				case 'failure':
					applyAction(result);
					toast.error(result.data?.message);
					console.error(result.data?.message);
					break;
				case 'error':
					toast.error(result.error.message, 5000);
					console.error(result.error.message);
					break;
				case 'success':
					// propogate custom claims
					await currentUser.getIdToken(true);
					toast.open('Username Updated!');
			}
		};
	};
</script>

{#if $user}
	<main class="mt-5 flex flex-col items-center justify-center gap-5">
		<form
			method="POST"
			class="flex flex-col items-center gap-5"
			action="/username?/updateUsername"
			use:enhance={updateProfile}
		>
			<div class="flex flex-col gap-2">
				<label for="username" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					Username
				</label>
				<input
					type="text"
					id="username"
					name="username"
					on:input={checkUsername}
					value={$user.username}
					class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
					required
					pattern="^[a-zA-Z0-9]+(?:[._][a-zA-Z0-9]+)*$"
					title="Username must be only alphanumeric or '.' characters."
				/>
				{#if available === true}
					<span class="flex gap-2 font-semibold text-green-600">Username Available!</span>
				{:else if available === false}
					<span class="flex gap-2 font-semibold text-red-600">Username is Taken!</span>
				{/if}
			</div>
			<button
				type="submit"
				class="w-fit rounded-lg border bg-blue-600 p-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!available}
			>
				Update
			</button>
		</form>
	</main>
{:else}
	<LoginWithGoogle />
{/if}
