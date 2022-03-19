<template>
  <div class="com-container">
    <!-- 三种销量趋势图表 -->
    <div class="title" :style="titleSizeAdapter">
      <span @click="showChoice = !showChoice" style='cursor: pointer;'>{{'▌ ' + chartTitle}}</span>
      <!-- 使用字体图标 -->
      <span class="iconfont arrow" :style="titleSizeAdapter" @click="showChoice = !showChoice">&#xe6eb;</span>
      <div v-show="showChoice"
      v-for = 'item in types'
      :key = 'item.key'
      @click="handleClick(item.key)"
      :style="titleIndent"
      style='cursor: pointer;'>
      {{item.text}}
      </div>
    </div>
    <div class="com-chart" ref='trend'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data () {
    return {
      echartsInst: null, // echarts实例对象
      data: null, // 服务器返回的数据
      showChoice: false,
      currentType: 'map',
      titleFontSize: 0
    }
  },
  // 在挂载时初始化echartsInst对象并且获取数据
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 挂载的时候也要调用一下
    this.screenAdapter()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdapter)
  },
  computed: {
    // 三种数据类型
    types () {
      if (this.data) {
        return this.data.type.filter(item => item.key !== this.currentType)
      } else {
        return []
      }
    },
    // 图表标题
    chartTitle () {
      if (this.data) {
        return this.data[this.currentType].title
      } else {
        return []
      }
    },
    // 给标题设置的行内样式
    titleSizeAdapter () {
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    // 给标题设置的行内样式
    titleIndent () {
      return {
        'text-indent': 1 + 'em',
        color: getThemeValue(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  methods: {
    // 初始化echartsInst对象
    initChart () {
      // 初始化同时设置echarts主题
      this.echartsInst = this.$echarts.init(this.$refs.trend, this.theme)
      // 配置初始化的option
      const initOption = {
        // 调整坐标轴位置
        grid: {
          top: '30%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false// 设置紧挨边缘
        },
        yAxis: { type: 'value' },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          left: 20,
          top: '15%'
        }
      }
      this.echartsInst.setOption(initOption)
    },
    // 从服务器获取数据
    async getData () {
      // axios返回的数据是一个promise对象
      // 解构赋值获取返回的对象中的data项
      const { data: ret } = await this.$http.get('trend')
      this.data = ret
      this.updateChart()
    },
    // 用获取到的数据更新图表
    updateChart () {
      // 半透明的颜色值
      const colorArr1 = [
        'rgba(11,168,44,0.5)',
        'rgba(44,110,255,0.5)',
        'rgba(22,242,217,0.5)',
        'rgba(254,33,30,0.5)',
        'rgba(250,105,0,0.5)'
      ]
      // 全透明的颜色值
      const colorArr2 = [
        'rgba(11,168,44,0)',
        'rgba(44,110,255,0)',
        'rgba(22,242,217,0)',
        'rgba(254,33,30,0)',
        'rgba(250,105,0,0)'
      ]
      const months = this.data.common.month
      const values = this.data[this.currentType].data
      const seriesArr = values.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: 'map', // 堆叠图效果，键值设为map
          areaStyle: {
            // 设置颜色渐变
            color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
              {
                offset: 0,
                color: colorArr1[index]
              },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        }
      })
      const nameArr = values.map(item => {
        return item.name
      })
      const dataOption = {
        xAxis: { data: months },
        series: seriesArr,
        legend: {
          data: nameArr
        }
      }
      this.echartsInst.setOption(dataOption)
    },
    handleClick (chosenType) {
      this.currentType = chosenType
      this.updateChart()
      this.showChoice = false
    },
    screenAdapter () {
      this.titleFontSize = this.$refs.trend.offsetWidth / 100 * 3.6
      // 根据目前分辨率设置配置项
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeigt: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        }
      }
      this.echartsInst.setOption(adapterOption)
      // 调用了resize才能实现整个图表的适配，上面只是对文字和柱的适配
      this.echartsInst.resize()
    }
  },
  watch: {
    // 主题切换
    theme () {
      this.echartsInst.dispose() // 销毁当前图表
      this.initChart()
      this.screenAdapter()
      this.updateChart()
    }
  }
}
</script>

<style scoped>
  .title {
    position: absolute;
    left: 20px;
    top: 10px;
    color: white;
    z-index: 1;
  }
  .arrow {
    margin-left: 10px;
    cursor: pointer;
  }
</style>
