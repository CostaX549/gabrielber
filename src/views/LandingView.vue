<template>
  <div class="pt-16">
    <h1 class="text-3xl font-semibold mb-4">Gabrielber</h1>
    <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
        <div class="bg-white px-4 py-5 sm:p-6">
            <div class="flex justify-between">
                <button
                        @click="handleStartDriving"
                        class="rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none">
                        Começar a Dirigir
                    </button>
                    <button
                        @click="handleFindARide"
                        class="rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none">
                        Procurar uma Corrida
                    </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>  
import http from '@/helpers/http';
import { useRouter } from 'vue-router';
const router = useRouter()
const handleStartDriving = () => {
    http().get('/api/driver')
    .then((response) => {
        if(response.data.driver) {
            router.push({
        name: 'standby'
    })
        } else {
            router.push({
                name: 'driver'
            })
        }
    })
    .catch((error) => {
        console.error(error)
    })
   
}
const handleFindARide = () => {
    router.push({
        name: 'location'
    })
}
</script>