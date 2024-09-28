<template>
    <div class="pt-16">
      <h1 class="text-3xl font-semibold mb-4">{{ title }}</h1>
      <div>
        <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
          <div class="bg-white px-4 py-5 sm:p-6">
            <div>
              <GMapMap :zoom="14" :center="parsedCurrentLocation" ref="gMap" style="width:100%; height: 256px;">
                <GMapMarker :position="parsedCurrentLocation" :icon="currentIcon" />
                <GMapMarker :position="parsedDriverLocation" :icon="driverIcon" />
              </GMapMap>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <span>{{ message }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useLocationStore } from '@/stores/location'
  import { useTripStore } from '@/stores/trip'
  import { useRouter } from 'vue-router'
  import { onMounted, ref, computed } from 'vue'
  import { useEcho } from '@/helpers/useEcho'
  
  const location = useLocationStore()
  const trip = useTripStore()
  const router = useRouter()
  let echo = useEcho()
  
  const title = ref('Esperando por um motorista...')
  const message = ref('Quando um motorista aceitar a viagem, suas informações aparecerão aqui.')
  const driverlocation = ref(null)
  
  const gMap = ref(null)
  const gMapObject = ref(null)
  
  const currentIcon = {
      url: 'https://openmoji.org/data/color/svg/1F920.svg',
      scaledSize: {
          width: 24,
          height: 24
      }
  }
  
  const driverIcon = {
      url: 'https://openmoji.org/data/color/svg/1F698.svg',
      scaledSize: {
          width: 32,
          height: 32
      }
  }
  
  // Computed property para converter as strings JSON para objetos
  const parsedCurrentLocation = computed(() => {
      return typeof location.current.geometry === 'string'
          ? JSON.parse(location.current.geometry)
          : location.current.geometry
  })
  
  const parsedDriverLocation = computed(() => {
      return typeof driverlocation.value === 'string'
          ? JSON.parse(driverlocation.value)
          : driverlocation.value
  })
  
  const updateMapBounds = () => {
      let originPoint = new google.maps.LatLng(parsedCurrentLocation.value),
          driverPoint = new google.maps.LatLng(parsedDriverLocation.value),
          latLngBounds = new google.maps.LatLngBounds()
  
      latLngBounds.extend(originPoint)
      latLngBounds.extend(driverPoint)
  
      gMapObject.value.fitBounds(latLngBounds)
  }
  
  onMounted(() => {
      gMap.value.$mapPromise.then((mapObject) => {
          gMapObject.value = mapObject
      })
  
      echo.channel(`passenger_${trip.user_id}`)
          .listen('TripAccepted', (e) => {
              trip.$patch(e.trip)
  
              title.value = "Um motorista está a caminho!"
              message.value = `${e.trip.driver.user.name} está vindo em um ${e.trip.driver.year} ${e.trip.driver.color} ${e.trip.driver.make} ${e.trip.driver.model} com uma placa #${e.trip.driver.license_plate}`
          })
          .listen('TripLocationUpdated', (e) => {
              trip.$patch(e.trip)
              driverlocation.value = e.trip.driver_location
              setTimeout(updateMapBounds, 1000)
          })
          .listen('TripStarted', (e) => {
              trip.$patch(e.trip)
              location.$patch({
                  current: {
                      geometry: e.trip.destination
                  }
              })
              driverlocation.value = e.trip.driver_location
              title.value = "Você está a caminho!"
              message.value = `Você está indo para ${e.trip.destination_name}`
          })
          .listen('TripEnded', (e) => {
              trip.$patch(e.trip)
  
              title.value = "Você chegou!"
              message.value = `Espero que você tenha gostado da sua viagem com ${e.trip.driver.user.name}`
  
              setTimeout(() => {
                  trip.reset()
                  location.reset()
  
                  router.push({
                      name: 'landing'
                  })
              }, 10000)
          })
  })
  </script>
  