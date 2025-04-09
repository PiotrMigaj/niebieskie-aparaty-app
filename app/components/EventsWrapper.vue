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

import type { EventDto } from '~/types/EventDto';
import type { UserDto } from '~/types/UserDto';

const pending = ref<boolean>(true);
const error = ref<any>(null);
const fullName = ref<string>("");
const events = ref<EventDto[]>([]);

const fetchFullName = async () => {
    const userDto = await $fetch('/api/fullName', {
        method: 'GET',
    }) as UserDto;
    fullName.value = userDto.fullName;
}

const fetchEvents = async () => {
    const result = await $fetch('/api/events', {
        method: 'GET',
    }) as EventDto[];

    // Sort the events by date, then createdAt
    result.sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sort files inside each event
    result.forEach(event => {
        event.files.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    });

    events.value = result;
    console.log(events.value)
};


const fetchData = async () => {
    try {
        await fetchFullName();
        await fetchEvents();
    } catch (err) {
        console.error("Error fetching data from backend: " + err)
        error.value = err;
    } finally {
        pending.value = false;
    }
};

onMounted(fetchData);
</script>