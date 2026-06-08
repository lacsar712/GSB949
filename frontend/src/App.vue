<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-sans">
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-indigo-600">CardGen</span>
            </div>
            <div class="ml-6 flex items-center space-x-4">
              <router-link to="/" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">Home</router-link>
              <router-link to="/admin" class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600">Admin</router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="flex-grow py-10">
      <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <router-view></router-view>
      </div>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          &copy; 2026 Card Generator System. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, mostly using Tailwind utility classes logic (simulated in style.css or here) */
</style>
