<template>
  <div class="pt-16">
    <h1 class="text-3xl font-semibold mb-4">Aqui está sua viagem</h1>
    <div>
        <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
            <div class="bg-white px-4 py-5 sm:p-6">
                <div>
                    <GMapMap :zoom="11" 
                    ref="gMap"
                    :center="location.destination.geometry"
                    style="width: 100%; height: 256px;">
                    <GMapMarker :position="location.destination.geometry"/>
                </GMapMap>
                </div>
                <div class="mt-2">
                    <p class="text-xl">Indo para <strong>{{ location.destination.name }}</strong></p>
                </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
                    <button
                       @click="handleConfirmTrip"
                        class="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none">
                        Vamos!</button>
                </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { useLocationStore } from '@/stores/location';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import http from '@/helpers/http'
import axios from 'axios';
import { ref } from 'vue';
import { useTripStore } from '@/stores/trip';
const location = useLocationStore()
const router = useRouter()
const gMap = ref(null)
const trip =  useTripStore()

const handleConfirmTrip = () => {
    http().post('/api/trip', {
        origin: location.current.geometry,
        destination: location.destination.geometry,
        destination_name: location.destination.name
    })
        .then((response) => {
           trip.$patch(response.data)
            router.push({
                name: 'trip'
            })
        })
        .catch((error) => {
            console.error(error)
        })
}

onMounted(async () => {
    // does the user have a location set?
    if (location.destination.name === '') {
        router.push({
            name: 'location'
        })
    }

    // lets get the users current location
    await location.updateCurrentLocation()

    // draw a path on the map
    gMap.value.$mapPromise.then((mapObject) => {

        let currentPoint = new google.maps.LatLng(location.current.geometry),
            destinationPoint = new google.maps.LatLng(location.destination.geometry),
            directionsService = new google.maps.DirectionsService,
            directionsDisplay = new google.maps.DirectionsRenderer({
                map: mapObject
            })

        directionsService.route({
            origin: currentPoint,
            destination: destinationPoint,
            avoidTolls: false,
            avoidHighways: false,
            travelMode: google.maps.TravelMode.DRIVING
        }, (res, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(res)
            } else {
                console.error(status)
            }
        })
    })
})
</script>