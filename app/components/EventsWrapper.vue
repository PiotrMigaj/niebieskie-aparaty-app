<template>
    <div>
        <div v-if="pending" class="flex justify-center p-10">
            <UProgress animation="swing" size="lg" />
        </div>
        <div v-else-if="error" class="text-red-500 font-medium text-center p-4">
            Błąd podczas pobierania danych z serwera.
        </div>
        <div v-else>
            <div v-if="events.length === 0" class="text-center p-4 text-gray-500">
                Nie masz żadnych wydarzeń.
            </div>
            <div v-else>
                <h1>Witaj {{ fullName }}, ponżiej lista Twoich wydarzeń:</h1>
                <div>
                    <EventItem class="mt-5" v-for="event in events" :key="event.eventId" :event="event" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const { events, pending, error, fullName, fetchData } = useEvents();

onMounted(fetchData);
</script>