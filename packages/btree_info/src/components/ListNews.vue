<script lang="ts" setup>
import { useFetch } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';
import ButtonPaging from './ButtonPaging.vue';
import LoadingSpinner from './LoadingSpinner.vue';

interface NewsItem {
  title: string;
  description: string;
}

interface NewsEntry {
  version: string;
  date: string;
  items: NewsItem[];
}

interface NewsJson {
  en: NewsEntry[];
  de: NewsEntry[];
}

const props = defineProps<{
  lang?: string;
}>();

const { isFetching, error, data, execute } = useFetch(
  '/news.json',
  { immediate: false },
).get().json<NewsJson>();

const loadingText = computed(() =>
  props.lang === 'de' ? 'Neuigkeiten werden geladen ...' : 'News is loading ...',
);
const loadingContainer = 800;
const page = ref(0);

const entries = computed<NewsEntry[]>(() => {
  if (!data.value) return [];
  return props.lang === 'de' ? data.value.de : data.value.en;
});

onMounted(() => execute());
</script>

<template>
  <div v-if="error" class="text-red-500 text-lg text-center p-5">
    {{ lang === 'de' ? 'Fehler beim Laden der Neuigkeiten.' : 'Error while loading news.' }} 😱 <br>
    <small>{{ error }}</small>
  </div>
  <div v-else>
    <LoadingSpinner
      v-if="isFetching"
      :height="loadingContainer"
      :text="loadingText"
    />
    <div v-if="entries.length > 0 && !isFetching">
      <ButtonPaging v-model="page" :length="entries.length" />
      <ol>
        <ul>
          <li v-for="(entry, index) in entries.slice(page, page + 5)" :key="index">
            <span class="font-semibold">{{ entry.version }} [{{ entry.date }}]</span>
            <ul class="py-2">
              <li v-for="(item, i) in entry.items" :key="i">
                <b>{{ item.title }}</b>
                {{ item.description }}
              </li>
            </ul>
          </li>
        </ul>
      </ol>
      <ButtonPaging v-model="page" :length="entries.length" />
    </div>
  </div>
</template>
