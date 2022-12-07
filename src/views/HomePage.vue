<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Document Scanner</ion-title>
        <ion-buttons slot="secondary">
          <ion-button @click="toggleMultipleSelectionMode">
            <ion-icon v-if="multipleSelectionMode" name="checkbox"></ion-icon>
            <ion-icon v-else name="checkbox-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="primary">
          <ion-button @click="presentActionSheet">
            <ion-icon ios="ellipsis-horizontal" md="ellipsis-vertical"></ion-icon>
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
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script lang="ts">
import { IonContent, IonHeader, IonFooter, IonButtons, IonButton, IonPage, IonTitle, IonToolbar, IonFab,IonFabButton,IonIcon, actionSheetController, isPlatform } from '@ionic/vue';
import Dynamsoft from 'mobile-web-capture';
import { WebTwain } from 'mobile-web-capture/dist/types/WebTwain';
import { DocumentConfiguration } from "mobile-web-capture/dist/types/Addon.Camera";
import { Base64Result } from "mobile-web-capture/dist/types/WebTwain.IO";
import { defineComponent, onMounted, ref } from 'vue';
import DWT from '../components/DWT.vue'
import { createOutline,cameraOutline,saveOutline,checkboxOutline,checkbox,ellipsisHorizontal,ellipsisVertical } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ThumbnailViewer } from 'mobile-web-capture/dist/types/WebTwain.Viewer';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Capacitor } from "@capacitor/core";
import { Share } from '@capacitor/share';
import { DynamsoftEnumsDWT } from 'mobile-web-capture/dist/types/Dynamsoft.Enum';

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

    onMounted(()=>{  
      if (Capacitor.getPlatform()==="android") {
        checkAndRequestCameraPermission();
      }
    });

    const checkAndRequestCameraPermission = async () => {
      let result = await AndroidPermissions.checkPermission(AndroidPermissions.PERMISSION.CAMERA);
      if (result.hasPermission == false) {
        let response = await AndroidPermissions.requestPermission(AndroidPermissions.PERMISSION.CAMERA);
        console.log(response.hasPermission);
      }
    }
    
    addIcons({
      'ellipsis-horizontal': ellipsisHorizontal,
      'ellipsis-vertical': ellipsisVertical,
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
        let container = document.createElement("div");
        container.className = "fullscreen";
        document.body.appendChild(container);

        const funcConfirmExit = (bExistImage:boolean):Promise<boolean> => {
          container.remove();
          return Promise.resolve(true);
        }

        const funcConfirmExitAfterSave = () => {
          container.remove();
        };

        let showVideoConfigs:DocumentConfiguration = {
          scannerViewer:{
            element: container,
            continuousScan: false,
            funcConfirmExit: funcConfirmExit,
          },
          documentEditorSettings:{
            funcConfirmExitAfterSave:funcConfirmExitAfterSave
          }
        };
        DWObject.Addon.Camera.scanDocument(showVideoConfigs);
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
        let container = document.createElement("div");
        container.className = "fullscreen";
        document.body.appendChild(container);
        const funcConfirmExitAfterSave = () => {
          container.remove();
        };
        const funcConfirmExit = (bChanged: boolean, previousViewerName: string):Promise<number | DynamsoftEnumsDWT.EnumDWT_ConfirmExitType> =>  {
          container.remove();
          return Promise.resolve(Dynamsoft.DWT.EnumDWT_ConfirmExitType.Exit);
        };
        let config:DocumentConfiguration = {
          documentEditorSettings:{
            funcConfirmExit:funcConfirmExit,
            funcConfirmExitAfterSave:funcConfirmExitAfterSave
          }
        };
        let documentEditor = DWObject.Viewer.createDocumentEditor(config);
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
        let filename = getFormattedDate()+".pdf";
        if (Capacitor.isNativePlatform()) {
          const OnSuccess = (result:Base64Result, indices:number[], type:number) => {
            console.log('successful');
            const share = async () => {
              let writingResult = await Filesystem.writeFile({
                path: filename,
                data: result.getData(0,result.getLength()),
                directory: Directory.Cache
              });
              console.log(writingResult);
              Share.share({
                title: filename,
                text: filename,
                url: writingResult.uri,
              });
            }
            share();
          }
          const OnFailure = () => {
            console.log('error');
          }
          DWObject.ConvertToBase64(getImageIndices(),Dynamsoft.DWT.EnumDWT_ImageType.IT_PDF,OnSuccess,OnFailure);
        }else{
          const OnSuccess = () => {
            console.log('successful');
          }
          const OnFailure = () => {
            console.log('error');
          }
          DWObject.SaveAllAsPDF(getFormattedDate()+".pdf",OnSuccess,OnFailure);
        }
      }
    }

    const getFormattedDate = () => {
      let date = new Date();

      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let min = date.getMinutes();
      let sec = date.getSeconds();

      let monthStr = (month < 10 ? "0" : "") + month;
      let dayStr = (day < 10 ? "0" : "") + day;
      let hourStr = (hour < 10 ? "0" : "") + hour;
      let minStr = (min < 10 ? "0" : "") + min;
      let secStr = (sec < 10 ? "0" : "") + sec;

      let str = date.getFullYear().toString() + monthStr + dayStr + hourStr + minStr + secStr;

      return str;
    }

    const getImageIndices = () => {
      let indices = [];
      if (DWObject) {
        for (let i=0;i<DWObject.HowManyImagesInBuffer;i++){
          indices.push(i)
        }
      }
      return indices;
    }

    const presentActionSheet = async () => {
        const actionSheet = await actionSheetController.create({
          header: 'Action',
          buttons: [
            {
              text: 'Save',
              handler: save
            },
            {
              text: 'Edit',
              handler: showDocumentEditor
            },
            {
              text: 'Cancel',
            },
          ],
        });
        await actionSheet.present();
      };

    return {
      onWebTWAINReady,
      startScan,
      multipleSelectionMode,
      save,
      showDocumentEditor,
      removeSelected,
      selectAll,
      deselectAll,
      presentActionSheet,
      toggleMultipleSelectionMode
    }
  }
});
</script>

<style scoped>
ion-buttons {
  overflow:auto;
}
</style>
