<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Home</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-button expand="full" @click="goToScanner()">Go to scanner</ion-button>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonButton, IonPage, IonTitle, IonToolbar, IonFab,IonFabButton,IonIcon, actionSheetController, isPlatform, useIonRouter } from '@ionic/vue';

import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonButton,
    IonPage,
    IonTitle,
    IonToolbar
  },
  setup() {
    const router = useIonRouter();
    const goToScanner = () => {
      router.push('/scanner');
    }

    return {
      goToScanner
    }
  }
});
</script>

<style scoped>
ion-buttons {
  overflow:auto;
}
</style>
