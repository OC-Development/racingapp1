<template>
  <div class="race-hud">
    <!-- Race Info Panel - Left Side -->
    <div class="race-info-panel">
      <!-- LAP Info -->
      <div class="race-info-item">
        <div class="icon-container">
          <v-icon icon="mdi-flag-triangle" class="race-icon green"></v-icon>
        </div>
        <div class="info-content">
          <span class="label green">LAP</span>
          <div class="value-row">
            <span class="value white">{{ lapText }}</span>
            <span class="sub-value gray">LAST LAP</span>
          </div>
        </div>
      </div>

      <!-- TOTAL Time -->
      <div class="race-info-item">
        <div class="icon-container">
          <v-icon icon="mdi-clock-outline" class="race-icon green"></v-icon>
        </div>
        <div class="info-content">
          <span class="label green">TOTAL</span>
          <span class="value white">{{ msToHMS(globalStore.activeRace.totalTime) }}</span>
        </div>
      </div>

      <!-- CURRENT Time -->
      <div class="race-info-item">
        <div class="icon-container">
          <v-icon icon="mdi-clock-outline" class="race-icon green"></v-icon>
        </div>
        <div class="info-content">
          <span class="label green">CURRENT</span>
          <span class="value white">{{ msToHMS(globalStore.activeRace.time) }}</span>
        </div>
      </div>

      <!-- BEST Time -->
      <div class="race-info-item">
        <div class="icon-container">
          <v-icon icon="mdi-star-outline" class="race-icon green"></v-icon>
        </div>
        <div class="info-content">
          <span class="label green">BEST</span>
          <span class="value white">{{ msToHMS(globalStore.activeRace.bestLap) }}</span>
        </div>
      </div>

      <!-- CHECKPOINT -->
      <div class="race-info-item">
        <div class="icon-container">
          <v-icon icon="mdi-map-marker-outline" class="race-icon green"></v-icon>
        </div>
        <div class="info-content">
          <span class="label green">CHECKPOINT</span>
          <span class="value white">{{ globalStore.activeRace.currentCheckpoint }}/{{ globalStore.activeRace.totalCheckpoints }}</span>
        </div>
      </div>
    </div>

    <!-- Leaderboard Panel - Right Side -->
    <div class="leaderboard-panel">
      <!-- Top racers -->
      <div 
        v-for="(racer, index) in topRacers" 
        :key="racer.RacerSource"
        class="leaderboard-item"
        :class="getLeaderboardClass(index, racer)"
      >
        <div class="position-number">{{ index + 1 }}</div>
        <div class="racer-name">{{ racer.RacerName }}</div>
        <div class="time-difference">
          {{ index === 0 ? '' : getTimeDifference(topRacers[0], racer) }}
        </div>
      </div>

      <!-- Player position if not in top display -->
      <div 
        v-if="shouldShowPlayerSeparately"
        class="leaderboard-item player-separate"
        :class="getLeaderboardClass(playerPosition, playerRacer)"
      >
        <div class="position-number">{{ playerPosition + 1 }}</div>
        <div class="racer-name">{{ playerRacer.RacerName }} <span class="me-indicator">ME</span></div>
        <div class="time-difference">
          {{ getTimeDifference(topRacers[0], playerRacer) }}
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

const maxDisplay = computed(() => 
  globalStore.baseData?.data?.hudSettings?.maxPositions || 5
);

const playerPosition = computed(() => {
  const pos = globalStore.activeRace.position;
  return pos && pos > 0 ? pos - 1 : -1;
});

const playerRacer = computed(() => {
  const racers = globalStore.activeRace.positions || [];
  return racers[playerPosition.value];
});

const topRacers = computed(() => {
  const racers = globalStore.activeRace.positions || [];
  return racers.slice(0, maxDisplay.value);
});

const shouldShowPlayerSeparately = computed(() => {
  return playerPosition.value >= maxDisplay.value && playerRacer.value;
});

const getLeaderboardClass = (index: number, racer: ActiveRacer) => {
  const classes = [];
  
  // Position-based colors
  if (index === 0) classes.push('first-place');
  else if (index === 1) classes.push('second-place');
  else if (index === 2) classes.push('third-place');
  
  // Player indicator
  if (racer && racer.RacerSource === playerRacer.value?.RacerSource) {
    classes.push('current-player');
  }
  
  return classes.join(' ');
};

const formatTimeDifference = (timeDiffMs: number): string => {
  if (timeDiffMs === 0) return "";
  
  const absoluteDiffSeconds = Math.abs(timeDiffMs) / 1000;
  const minutes = Math.floor(absoluteDiffSeconds / 60);
  const seconds = absoluteDiffSeconds % 60;
  
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toFixed(3).padStart(6, '0')}`;
  return `-${formattedTime}`;
};

const getTimeDifference = (leader: ActiveRacer, racer: ActiveRacer): string => {
  if (!leader || !racer) return "";
  
  const leaderCheckpoints = leader.CheckpointTimes?.length || 0;
  const racerCheckpoints = racer.CheckpointTimes?.length || 0;

  if (leaderCheckpoints === 0 || racerCheckpoints === 0) {
    return "";
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
  top: 80px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 1001;
}

.race-info-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 8px 12px;
  min-width: 200px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.icon-container {
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.race-icon {
  font-size: 16px;
  
  &.green {
    color: #8BC34A;
  }
}

.info-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  line-height: 1;
  margin-bottom: 4px;
  
  &.green {
    color: #8BC34A;
  }
}

.value {
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  
  &.white {
    color: #FFFFFF;
  }
}

.sub-value {
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &.gray {
    color: #999999;
  }
}

.leaderboard-panel {
  position: absolute;
  top: 80px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 1001;
  min-width: 300px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
  min-height: 40px;
}

.leaderboard-item.first-place {
  background: rgba(139, 195, 74, 0.2);
  border-color: #8BC34A;
}

.leaderboard-item.second-place {
  background: rgba(255, 193, 7, 0.2);
  border-color: #FFC107;
}

.leaderboard-item.third-place {
  background: rgba(255, 152, 0, 0.2);
  border-color: #FF9800;
}

.leaderboard-item.current-player {
  background: rgba(244, 67, 54, 0.3);
  border-color: #F44336;
  box-shadow: 0 0 8px rgba(244, 67, 54, 0.4);
}

.leaderboard-item.player-separate {
  margin-top: 8px;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
}

.position-number {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  min-width: 20px;
  text-align: center;
  margin-right: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
}

.racer-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 8px;
}

.me-indicator {
  font-size: 10px;
  font-weight: 700;
  color: #F44336;
  background: rgba(244, 67, 54, 0.2);
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #F44336;
}

.time-difference {
  font-size: 12px;
  font-weight: 600;
  color: #FFFFFF;
  text-align: right;
  min-width: 90px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.9);
}

.track-name {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
  background: rgba(0, 0, 0, 0.7);
  padding: 8px 16px;
  border-radius: 4px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ghosted-indicator {
  position: absolute;
  bottom: 100px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(156, 39, 176, 0.9);
  color: #FFFFFF;
  padding: 8px;
  border-radius: 50%;
  backdrop-filter: blur(4px);
  animation: pulse 2s infinite;
  width: 40px;
  height: 40px;
}

.ghost-icon {
  font-size: 20px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .race-info-panel {
    left: 15px;
    top: 70px;
  }
  
  .leaderboard-panel {
    right: 15px;
    top: 70px;
    min-width: 280px;
  }
  
  .race-info-item {
    min-width: 180px;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .race-info-panel {
    left: 10px;
    top: 60px;
  }
  
  .leaderboard-panel {
    right: 10px;
    top: 60px;
    min-width: 250px;
  }
  
  .track-name {
    font-size: 14px;
    top: 15px;
  }
  
  .race-info-item {
    min-width: 160px;
    padding: 6px 8px;
  }
  
  .leaderboard-item {
    padding: 6px 8px;
    min-height: 36px;
  }
  
  .racer-name {
    font-size: 13px;
  }
  
  .time-difference {
    font-size: 11px;
    min-width: 80px;
  }
}
</style>