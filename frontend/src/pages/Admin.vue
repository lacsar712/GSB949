<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">卡券管理 (Card Management)</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">查看所有生成的卡券及其状态。</p>
      </div>
      <button @click="fetchCards" class="btn btn-primary text-sm">刷新 (Refresh)</button>
    </div>
    
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="card in cards" :key="card.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ card.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">{{ card.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ card.type_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">¥{{ card.price }}</td>
             <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(card.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ card.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ card.created_at }}</td>
          </tr>
          <tr v-if="cards.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500 text-sm">No cards found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      cards: []
    }
  },
  mounted() {
    this.fetchCards();
  },
  methods: {
    async fetchCards() {
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await axios.get(`${baseURL}/api/cards`);
        this.cards = response.data.records;
      } catch (error) {
        console.error(error);
        alert('Failed to load cards.');
      }
    },
    statusClass(status) {
        if(status === 'active') return 'bg-green-100 text-green-800';
        if(status === 'used') return 'bg-gray-100 text-gray-800';
        return 'bg-red-100 text-red-800';
    }
  }
}
</script>

<style scoped>
.font-mono { font-family: monospace; }
.overflow-x-auto { overflow-x: auto; }
.min-w-full { min-width: 100%; }
.divide-y > * + * { border-top-width: 1px; }
.tracking-wider { letter-spacing: 0.05em; }
.whitespace-nowrap { white-space: nowrap; }
.uppercase { text-transform: uppercase; }
.text-xs { font-size: 0.75rem; }
.bg-green-100 { background-color: #d1fae5; }
.text-green-800 { color: #065f46; }
.bg-red-100 { background-color: #fee2e2; }
.text-red-800 { color: #991b1b; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-800 { color: #1f2937; }
</style>
