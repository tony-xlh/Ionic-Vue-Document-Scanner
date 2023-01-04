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
  setup(props, ctx){
    const containerID = "dwtcontrolContainer";
    const DWObject = ref();
    const thumbnail = ref();
    const container = ref(null);

    const OnWebTWAINReady = () => {
      DWObject.value = Dynamsoft.DWT.GetWebTwain(containerID);
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
      let thumbnailViewerSettings = {
        location: 'left',
        size: '100%',
        columns: 2,
        rows: 3,
        scrollDirection: 'vertical', // 'horizontal'
        pageMargin: 10,
        background: "rgb(255, 255, 255)",
        border: '',
        allowKeyboardControl: true,
        allowPageDragging: true,
        allowResizing: false,
        showPageNumber: true,
        pageBackground: "transparent",
        pageBorder: "1px solid rgb(238, 238, 238)",
        hoverBackground: "rgb(239, 246, 253)",
        hoverPageBorder: "1px solid rgb(238, 238, 238)",
        placeholderBackground: "rgb(251, 236, 136)",
        selectedPageBorder: "1px solid rgb(125,162,206)",
        selectedPageBackground: "rgb(199, 222, 252)"
      };
      thumbnail.value = DWObject.value.Viewer.createThumbnailViewer(thumbnailViewerSettings);
      thumbnail.value.show();
      ctx.emit("onWebTWAINReady",DWObject.value,thumbnail.value);
    }

    onMounted(async () => {
      console.log("on mounted");
      Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', () => {
      OnWebTWAINReady();
    });
      Dynamsoft.DWT.UseLocalService = false;
      Dynamsoft.DWT.ResourcesPath = "assets/dwt-resources";
      Dynamsoft.DWT.Containers = [{
          WebTwainId: 'dwtObject',
          ContainerId: containerID,
          Width: '300px',
          Height: '400px'
      }];
      Dynamsoft.DWT.ProductKey = "t01509gIAAAoQpK3c9EfPo8P0y+sn6/TItS2tSqWwY+5SXE7QH0BS2rEoKTmAKmOgUWoSVAgPDhxWHwOjp2VplYRj6NuG076k5YYIDGYTbavUp+IMV/AwoAPAF9kDe+UHPPVzG1VwgBnQBFg3/oDjkN9eMQjpATOgCTgO6UDQyda/qbwUsoyQEgJmQBMwQjpQud7d5zd/ZZW+";
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
