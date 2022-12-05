<template>
  <div id="dwtcontrolContainer" ref="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import Dynamsoft from 'mobile-web-capture';

export default defineComponent({
  name: 'DWT',
  props: ['width','height'],
  emits: ['onWebTWAINReady'],
  components: {
    
  },
  setup(props,ctx){
    const containerID = "dwtcontrolContainer";
    const DWObject = ref();
    const container = ref(null);

    const OnWebTWAINReady = () => {
      DWObject.value = Dynamsoft.DWT.GetWebTwain(containerID);
      ctx.emit("onWebTWAINReady",DWObject.value);
      console.log(container);
      if (container.value) {
        let el = container.value as HTMLElement;
        if (props.height) {
          DWObject.value.Viewer.height = props.height;
          el.style.height = props.height;
        }
        if (props.width) {
          DWObject.value.Viewer.width = props.width;
          el.style.width = props.width;
        }
      }
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
    });

    // expose to template and other options API hooks
    return {
      container
    }
  }
});
</script>

<style scoped>

</style>
