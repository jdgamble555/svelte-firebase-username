<script>
	import Toast from '@components/toast.svelte';
	import { useToast } from '$lib/use-toast';
	import '../app.css';
	useToast();
</script>

<Toast />
<slot />
<nav class="flex gap-3 justify-center mt-5">
	<a href="/">Home</a>
	<a href="/username">Edit Username</a>
</nav>