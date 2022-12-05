<template>
  <div id="dwtcontrolContainer"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Dynamsoft from 'mobile-web-capture';

export default defineComponent({
  name: 'DWT',
  components: {
    
  },
  setup(){
    const containerID = "dwtcontrolContainer";
    const DWObject = ref();
    const count = ref(0);

    const OnWebTWAINReady = () => {
      DWObject.value = Dynamsoft.DWT.GetWebTwain(containerID);
      console.log(DWObject.value);
    }

    onMounted(async () => {
      console.log("on mounted");
      Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      OnWebTWAINReady();
    });
      Dynamsoft.DWT.UseLocalService = false;
      Dynamsoft.DWT.ResourcesPath = "dwt-resources";
      Dynamsoft.DWT.Containers = [{
          WebTwainId: 'dwtObject',
          ContainerId: containerID,
          Width: '300px',
          Height: '400px'
      }];
      Dynamsoft.DWT.Load();
    })

    // expose to template and other options API hooks
    return {
      count
    }
  }
});
</script>

<style scoped>

</style>
