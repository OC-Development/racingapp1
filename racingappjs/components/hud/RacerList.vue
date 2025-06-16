<template>
  <div class="racers-holder">
    <div
      class="box"
      v-for="(racer, index) in shortenedRacers"
      :key="racer.RacerSource"
      :class="{
        me: index === globalStore.activeRace.position - 1,
        highlight: index < 3
      }"
    >
      <div class="number">{{ index + 1 }}</div>
      <span class="name">{{ racer.RacerName }}</span>
      <span
        class="difference"
        v-if="index !== 0 && !racer.Finished"
      >
        {{ getTimeDifference(shortenedRacers[index - 1], racer) }}
      </span>
      <span class="difference" v-else-if="racer.Finished">
        {{ translate('finished') }}
      </span>
      <span class="difference" v-else-if="index === 0">
      </span>
    </div>

    <div
      v-if="!isMeVisibleInTop && myRacer"
      class="box me separate"
    >
      <div class="number">{{ playerIndex + 1 }}</div>
      <span class="name">{{ myRacer.RacerName }}</span>
      <span
        class="difference"
        v-if="playerIndex > 0"
      >
        {{ getTimeDifference(props.racers[playerIndex - 1], myRacer) }}
      </span>
      <span class="difference" v-else>
        +0.000
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from "@/store/global";
import { ActiveRacer } from "../../store/types";
import { computed } from "vue";
import { translate } from "@/helpers/translate";

const props = defineProps<{
  racers: ActiveRacer[];
}>();

const globalStore = useGlobalStore();

const playerIndex = computed(() => {
  const pos = globalStore.activeRace.position;
  return pos && pos > 0 ? pos - 1 : -1;
});

const shortenedRacers = computed(() =>
  props.racers?.slice(
    0,
    globalStore.baseData?.data?.hudSettings?.maxPositions || 5
  )
);

const myRacer = computed(() =>
  props.racers[playerIndex.value]
);

const isMeVisibleInTop = computed(() =>
  playerIndex.value >= 0 && playerIndex.value < shortenedRacers.value.length
);

const formatTimeDifference = (timeDiffMs: number): string => {
  if (timeDiffMs === 0) {
    return "+0.000";
  }
  const isAhead = timeDiffMs > 0;
  const absoluteDiffSeconds = Math.abs(timeDiffMs) / 1000;
  const formattedTime = absoluteDiffSeconds.toFixed(3);
  return isAhead ? `+${formattedTime}` : `-${formattedTime}`;
};

const getTimeDifference = (racer1: ActiveRacer, racer2: ActiveRacer) => {
  const racer1Checkpoints = racer1.CheckpointTimes?.length || 0;
  const racer2Checkpoints = racer2.CheckpointTimes?.length || 0;

  if (racer1Checkpoints === 0 || racer2Checkpoints === 0) {
    return "+0.000";
  }

  const lastCommonCheckpoint = Math.min(racer1Checkpoints, racer2Checkpoints) - 1;
  const racer1Time = racer1.CheckpointTimes[lastCommonCheckpoint].time;
  const racer2Time = racer2.CheckpointTimes[lastCommonCheckpoint].time;

  return formatTimeDifference(racer2Time - racer1Time);
};
</script>

<style scoped lang="scss">
.racers-holder {
  position: fixed;
  top: 5%;
  left: 1%;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  width: auto;
  min-width: 280px;
  max-width: 300px;
  z-index: 9999;
}

.box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 150, 255, 0.15);
  border-radius: 0.3em;
  font-size: 0.9em;
  font-family: "Poppins", sans-serif !important;
  text-transform: uppercase;
  color: #ffffff;
  height: 2.2em;
  width: 80%;
  position: relative;
  transition: transform 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.box:hover {
  transform: scale(1.02);
  background: rgba(0, 0, 0, 0.85);
}

.number {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 2.2em;
  height: 100%;
  border-radius: 0.3em 0 0 0.3em;
  font-size: 1em;
  font-weight: bold;
  color: #ffffff;
  background: rgba(0, 119, 255, 0.15);
  margin: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.name {
  flex: 1;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 0.8em;
  font-size: 0.85em;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.difference {
  font-size: 0.9em;
  color: #ffffff;
  // border: #e74d3c36;
  // background-color: #850f0f31;
  padding: 0.8em;
  border-radius: 0.3em;
  margin: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.box:first-child {
  background: rgba(0, 150, 255, 0.15);
  .number {
    background: rgba(0, 255, 34, 0.212);
  }
}

.me {
  background: rgba(0, 150, 255, 0.15);
  .number {
    background: rgba(255, 0, 21, 0.418);
  }
}

.separate {
  margin-top: 1.2em;
}

@media (max-width: 768px) {
  .racers-holder {
    left: 0.5em;
    min-width: 250px;
}
}
</style>
