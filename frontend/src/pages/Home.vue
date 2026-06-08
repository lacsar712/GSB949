<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg max-w-2xl mx-auto p-6">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-700">生成卡券 (Generate Cards)</h2>
      <p class="text-gray-500 text-sm mt-1">选择卡券类型并生成。</p>
    </div>

    <form @submit.prevent="generateCards" class="space-y-6">
      <div>
        <label class="label-text">卡券类型 (Card Type)</label>
        <select v-model="form.type" class="input-field">
          <option value="Monthly">月卡 (Monthly - 10元)</option>
          <option value="Xianyu">闲鱼专享 (Xianyu - 5元)</option>
        </select>
      </div>

      <div>
        <label class="label-text">生成数量 (Quantity)</label>
        <input type="number" v-model.number="form.count" min="1" max="100" class="input-field" />
      </div>

      <div class="pt-4">
        <button type="submit" class="btn btn-primary w-full justify-center">
          立即生成 (Generate)
        </button>
      </div>
    </form>

    <div v-if="loading" class="mt-6 text-center text-gray-500">
      Processing...
    </div>

    <div v-if="result" class="mt-8">
      <h3 class="text-lg font-medium text-gray-900">生成结果 (Generated Cards):</h3>
      <div class="card-grid">
        <div v-for="code in result" :key="code" class="card-item text-center">
           <code class="text-indigo-600 font-bold block">{{ code }}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      form: {
        type: 'Monthly',
        count: 1
      },
      result: null,
      loading: false
    }
  },
  methods: {
    async generateCards() {
      this.loading = true;
      this.result = null;
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const response = await axios.post(`${baseURL}/api/generate`, this.form);
        this.result = response.data.cards;
      } catch (error) {
        console.error(error);
        alert('Generation failed: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.space-y-6 > * + * { margin-top: 1.5rem; }
.w-full { width: 100%; }
.justify-center { justify-content: center; }
</style>
