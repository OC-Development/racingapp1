<template>
  <div class="race-hud">
    <!-- Race Info Panel - Left Side -->
    <div class="race-info-panel">
      <div class="race-info-item lap-info">
        <div class="icon-container">
          <v-icon icon="mdi-flag-checkered" class="race-icon"></v-icon>
        </div>
        <div class="info-content">
          <span class="label">LAP</span>
          <span class="value">{{ lapText }}</span>
          <span class="sub-label" v-if="globalStore.activeRace.totalLaps > 0">LAST LAP</span>
        </div>
      </div>

      <div class="race-info-item time-info">
        <div class="icon-container">
          <v-icon icon="mdi-timer" class="race-icon"></v-icon>
        </div>
        <div class="info-content">
          <span class="label">TOTAL</span>
          <span class="value">{{ msToHMS(globalStore.activeRace.totalTime) }}</span>
        </div>
      </div>

      <div class="race-info-item time-info">
        <div class="icon-container">
          <v-icon icon="mdi-timer-outline" class="race-icon"></v-icon>
        </div>
        <div class="info-content">
          <span class="label">CURRENT</span>
          <span class="value">{{ msToHMS(globalStore.activeRace.time) }}</span>
        </div>
      </div>

      <div class="race-info-item time-info">
        <div class="icon-container">
          <v-icon icon="mdi-star" class="race-icon"></v-icon>
        </div>
        <div class="info-content">
          <span class="label">BEST</span>
          <span class="value">{{ msToHMS(globalStore.activeRace.bestLap) }}</span>
        </div>
      </div>

      <div class="race-info-item checkpoint-info">
        <div class="icon-container">
          <v-icon icon="mdi-map-marker" class="race-icon"></v-icon>
        </div>
        <div class="info-content">
          <span class="label">CHECKPOINT</span>
          <span class="value">{{ globalStore.activeRace.currentCheckpoint }}/{{ globalStore.activeRace.totalCheckpoints }}</span>
        </div>
      </div>
    </div>

    <!-- Leaderboard Panel - Right Side -->
    <div class="leaderboard-panel">
      <div 
        v-for="(racer, index) in displayRacers" 
        :key="racer.RacerSource"
        class="leaderboard-item"
        :class="{ 
          'current-player': index === globalStore.activeRace.position - 1,
          'first-place': index === 0,
          'second-place': index === 1,
          'third-place': index === 2
        }"
      >
        <div class="position-number">{{ index + 1 }}</div>
        <div class="racer-name">{{ racer.RacerName }}</div>
        <div class="time-difference" v-if="index > 0 && !racer.Finished">
          {{ getTimeDifference(displayRacers[0], racer) }}
        </div>
        <div class="time-difference finished" v-else-if="racer.Finished">
          FINISHED
        </div>
      </div>
    </div>

    <!-- Track Name -->
    <div class="track-name">
      {{ globalStore.activeRace.raceName }}
    </div>

    <!-- Ghosted Indicator -->
    <div class="ghosted-indicator" v-if="globalStore.activeRace.ghosted">
      <v-icon icon="mdi-ghost" class="ghost-icon"></v-icon>
      <span>GHOSTED</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalStore } from "@/store/global";
import { msToHMS } from "@/helpers/msToHMS";
import { computed } from "vue";
import { ActiveRacer } from "@/store/types";

const globalStore = useGlobalStore();

const lapText = computed(() => {
  if (globalStore.activeRace.totalLaps === 0) return "SPRINT";
  else if (globalStore.activeRace.totalLaps === -1)
    return `${globalStore.activeRace.currentLap}/-`;
  return `${globalStore.activeRace.currentLap}/${globalStore.activeRace.totalLaps}`;
});

const displayRacers = computed(() => {
  const maxDisplay = 8;
  const racers = globalStore.activeRace.positions || [];
  const playerPosition = globalStore.activeRace.position - 1;
  
  if (racers.length <= maxDisplay) {
    return racers;
  }
  
  // If player is in top positions, show top racers
  if (playerPosition < maxDisplay - 2) {
    return racers.slice(0, maxDisplay);
  }
  
  // If player is further down, show top 3 + player area
  const topRacers = racers.slice(0, 3);
  const playerArea = racers.slice(playerPosition - 1, playerPosition + 2);
  
  return [...topRacers, ...playerArea].filter((racer, index, arr) => 
    arr.findIndex(r => r.RacerSource === racer.RacerSource) === index
  );
});

const formatTimeDifference = (timeDiffMs: number): string => {
  if (timeDiffMs === 0) return "-00:00.000";
  
  const isAhead = timeDiffMs > 0;
  const absoluteDiffSeconds = Math.abs(timeDiffMs) / 1000;
  
  const minutes = Math.floor(absoluteDiffSeconds / 60);
  const seconds = absoluteDiffSeconds % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
  return isAhead ? `-${formattedTime}` : `+${formattedTime}`;
};

const getTimeDifference = (leader: ActiveRacer, racer: ActiveRacer): string => {
  const leaderCheckpoints = leader.CheckpointTimes?.length || 0;
  const racerCheckpoints = racer.CheckpointTimes?.length || 0;

  if (leaderCheckpoints === 0 || racerCheckpoints === 0) {
    return "-00:00.000";
  }

  const lastCommonCheckpoint = Math.min(leaderCheckpoints, racerCheckpoints) - 1;
  const leaderTime = leader.CheckpointTimes[lastCommonCheckpoint].time;
  const racerTime = racer.CheckpointTimes[lastCommonCheckpoint].time;

  return formatTimeDifference(racerTime - leaderTime);
};
</script>

<style scoped lang="scss">
.race-hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 1000;
  font-family: 'Roboto', sans-serif;
}

.race-info-panel {
  position: absolute;
  top: 60px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 1001;
}

.race-info-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
  padding: 8px 12px;
  min-width: 180px;
  border-left: 3px solid #9CCC65;
  backdrop-filter: blur(4px);
}

.icon-container {
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.race-icon {
  color: #9CCC65;
  font-size: 18px;
}

.info-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.label {
  font-size: 11px;
  font-weight: 600;
  color: #9CCC65;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
  margin-bottom: 2px;
}

.value {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.sub-label {
  font-size: 9px;
  color: #CCCCCC;
  text-transform: uppercase;
  margin-top: 2px;
  line-height: 1;
}

.leaderboard-panel {
  position: absolute;
  top: 60px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1001;
  min-width: 280px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
  padding: 8px 12px;
  backdrop-filter: blur(4px);
  border-left: 3px solid #666666;
  transition: all 0.3s ease;
}

.leaderboard-item.first-place {
  border-left-color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
}

.leaderboard-item.second-place {
  border-left-color: #C0C0C0;
  background: rgba(192, 192, 192, 0.1);
}

.leaderboard-item.third-place {
  border-left-color: #CD7F32;
  background: rgba(205, 127, 50, 0.1);
}

.leaderboard-item.current-player {
  border-left-color: #FF5722;
  background: rgba(255, 87, 34, 0.15);
  box-shadow: 0 0 10px rgba(255, 87, 34, 0.3);
}

.position-number {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  min-width: 24px;
  text-align: center;
  margin-right: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.racer-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.time-difference {
  font-size: 12px;
  font-weight: 600;
  color: #FF5722;
  text-align: right;
  min-width: 80px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.time-difference.finished {
  color: #4CAF50;
  font-size: 11px;
}

.track-name {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 700;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
}

.ghosted-indicator {
  position: absolute;
  bottom: 100px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(156, 39, 176, 0.9);
  color: #FFFFFF;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  animation: pulse 2s infinite;
}

.ghost-icon {
  font-size: 18px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .race-info-panel {
    left: 15px;
    top: 50px;
  }
  
  .leaderboard-panel {
    right: 15px;
    top: 50px;
    min-width: 250px;
  }
  
  .race-info-item {
    min-width: 160px;
    padding: 6px 10px;
  }
  
  .value {
    font-size: 14px;
  }
  
  .label {
    font-size: 10px;
  }
}

@media (max-width: 768px) {
  .race-info-panel {
    left: 10px;
    top: 40px;
  }
  
  .leaderboard-panel {
    right: 10px;
    top: 40px;
    min-width: 220px;
  }
  
  .track-name {
    font-size: 16px;
    top: 15px;
  }
  
  .race-info-item {
    min-width: 140px;
    padding: 6px 8px;
  }
  
  .leaderboard-item {
    padding: 6px 8px;
  }
  
  .racer-name {
    font-size: 13px;
  }
  
  .time-difference {
    font-size: 11px;
    min-width: 70px;
  }
}
</style>