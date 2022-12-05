<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Document Scanner</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="save">
            <ion-icon name="save-outline"></ion-icon>
          </ion-button>
          <ion-button @click="showDocumentEditor">
            <ion-icon name="create-outline"></ion-icon>
          </ion-button>
          <ion-button @click="toggleMultipleSelectionMode">
            <ion-icon v-if="multipleSelectionMode" name="checkbox"></ion-icon>
            <ion-icon v-else name="checkbox-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true">
      <DWT width="100%" height="100%" @onWebTWAINReady="onWebTWAINReady"></DWT>
      <ion-fab vertical="bottom" horizontal="start" slot="fixed">
        <ion-fab-button @click="startScan">
          <ion-icon name="camera-outline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
    <ion-footer v-if="multipleSelectionMode">
      <ion-toolbar>
        <div style="width:100%;height:100%;overflow:auto;">
          <ion-buttons>
            <ion-button @click="selectAll">
              Select All
            </ion-button>
            <ion-button @click="deselectAll">
              Deselct All
            </ion-button>
            <ion-button @click="removeSelected">
              Remove Selected
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonPage, IonTitle, IonToolbar, IonFab,IonFabButton,IonIcon } from '@ionic/vue';
import { WebTwain } from 'mobile-web-capture/dist/types/WebTwain';
import { defineComponent, ref } from 'vue';
import DWT from '../components/DWT.vue'
import { createOutline,cameraOutline,saveOutline,checkboxOutline,checkbox } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ThumbnailViewer } from 'mobile-web-capture/dist/types/WebTwain.Viewer';

export default defineComponent({
  name: 'HomePage',
  components: {
    IonContent,
    IonHeader,
    IonFooter,
    IonButtons,
    IonButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    DWT
  },
  setup() {
    addIcons({
      'create-outline': createOutline,
      'camera-outline': cameraOutline,
      'save-outline': saveOutline,
      'checkbox': checkbox,
      'checkbox-outline': checkboxOutline,
    });

    let DWObject: WebTwain|null;
    let thumbnailViewer: ThumbnailViewer|null;
    const onWebTWAINReady = (dwt:WebTwain,viewer:ThumbnailViewer) => {
      DWObject = dwt;
      thumbnailViewer = viewer;
    };
    const multipleSelectionMode = ref(false);

    const startScan = () => {
      if (DWObject) {
        DWObject.Addon.Camera.scanDocument();
      }
    };

    const toggleMultipleSelectionMode = () => {
      multipleSelectionMode.value = !multipleSelectionMode.value;
      if (thumbnailViewer) {
        thumbnailViewer.showCheckbox = multipleSelectionMode.value;
      }
    };

    const showDocumentEditor = () => {
      if (DWObject) {
        let documentEditor = DWObject.Viewer.createDocumentEditor();
        documentEditor.show();
      }
    }

    const removeSelected = () => {
      if (DWObject) {
        DWObject.RemoveAllSelectedImages();
      }
    }

    const selectAll = () => {
      if (DWObject) {
        DWObject.SelectAllImages();
      }
    }

    const deselectAll = () => {
      if (DWObject) {
        DWObject.SelectImages([]);
      }
    }

    const save = () => {
      if (DWObject) {
        const OnSuccess = () => {
          console.log('successful');
        }
        const OnFailure = () => {
          console.log('error');
        }
        DWObject.SaveAllAsPDF("Scanned.pdf",OnSuccess,OnFailure);
      }
    }

    return {
      onWebTWAINReady,
      startScan,
      multipleSelectionMode,
      save,
      showDocumentEditor,
      removeSelected,
      selectAll,
      deselectAll,
      toggleMultipleSelectionMode
    }
  }
});
</script>

<style scoped>
</style>
