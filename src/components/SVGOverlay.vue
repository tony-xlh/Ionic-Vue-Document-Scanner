<script lang="tsx">
//https://vuejs.org/guide/typescript/overview about JSX
import { Capacitor } from '@capacitor/core';
import { defineComponent, PropType } from 'vue';
import { type DetectedQuadResultItem } from 'dynamsoft-document-normalizer'
export default defineComponent({
  name: 'SVGOverlay',
  props: {
    quad: {
      type: Object as PropType<DetectedQuadResultItem|undefined>,
      required: true,
    },
    viewBox: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const getPointsData = (quad:DetectedQuadResultItem) => {
      const points = quad.location.points;
      let pointsData = points[0].x+","+ points[0].y + " ";
      pointsData = pointsData+ points[1].x +"," + points[1].y + " ";
      pointsData = pointsData+ points[2].x +"," + points[2].y + " ";
      pointsData = pointsData+ points[3].x +"," + points[3].y;
      return pointsData;
    }
    return () => (
      <svg 
        id="overlay"
        class={Capacitor.isNativePlatform() ? "fixed" : "absolute"}
        preserveAspectRatio="xMidYMid slice"
        viewBox={props.viewBox}
        xmlns="<http://www.w3.org/2000/svg>">
        {props.quad && (
          <polygon xmlns="<http://www.w3.org/2000/svg>"
            points={getPointsData(props.quad)}
          />
        )}  
      </svg>
    );
  },
});
</script>

<style scoped>
#overlay {
  left: 0;
  top: 0;
  top: env(safe-area-inset-top);
  width: 100%;
  height: 100%;
  height: calc(100% - env(safe-area-inset-top));
}

.fixed {
  position: fixed;
}

.absolute {
  position: absolute;
}

#overlay polygon {
  fill: rgba(85,240,40,0.5);
  stroke: green;
  stroke-width: 2px;
}
</style>
