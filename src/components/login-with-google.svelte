<script lang="ts">
	import { loginWithGoogle, reLoginWithGoogle, useRelogin } from '$lib/user-user';

	const relogin = useRelogin();

	const login = async () => {
		if ($relogin) {
			await reLoginWithGoogle();
			relogin.set(false);
			return;
		}
		await loginWithGoogle();
	};
</script>

<form method="POST" on:submit|preventDefault={login}>
	<button type="submit" class="bg-red-600 p-2 font-semibold text-white">
		Signin with Google
	</button>
</form>
{#if $relogin}
	<p>You must re-signin to change your email.</p>
{/if}
