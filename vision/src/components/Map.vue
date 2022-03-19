<template>
  <div class="com-container" @click = 'backToChinaMap'>
    <div class="com-chart" ref="map"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import chinaMap from '../../public/static/map/china.json' // 从本地导入地图数据
import { getProvinceMapInfo } from '@/utils/map_utils'
import axios from 'axios'
export default {
  data () {
    return {
      echartsInst: null,
      data: null
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
  methods: {
    initChart () {
      // 初始化同时设置echarts主题
      this.echartsInst = this.$echarts.init(this.$refs.map, this.theme)
      this.$echarts.registerMap('china', chinaMap)
      // 配置初始化的option
      const initOption = {
        title: {
          text: '▌ 商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%'
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.echartsInst.setOption(initOption)
      // 设置点击省份可放大
      this.echartsInst.on('click', async target => {
        const provinceInfo = getProvinceMapInfo(target.name)
        // 这里不使用$http而使用axios是因为$http设置了基准路径，与要请求的路径不同
        const ret = await axios.get('http://localhost:8080' + provinceInfo.path)
        this.$echarts.registerMap(provinceInfo.key, ret.data)
        const provinceOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.echartsInst.setOption(provinceOption)
      })
    },
    // 从服务器获取数据
    async getData () {
      // axios返回的数据是一个promise对象
      // 解构赋值获取返回的对象中的data项
      const { data: ret } = await this.$http.get('map')
      this.data = ret
      this.updateChart()
    },
    // 用获取到的数据更新图表
    updateChart () {
      const legendArr = []
      const seriesArr = []
      for (let i = 0; i < this.data.length; i++) {
        // 每一个对象代表一个类别下的所有散点数据
        seriesArr.push({
          type: 'effectScatter', // 散点涟漪动画
          rippleEffect: {
            scale: 8, // 控制涟漪大小
            brushType: 'stroke' // 改变涟漪样式
          },
          name: this.data[i].name,
          data: this.data[i].children,
          coordinateSystem: 'geo' // 关键步骤：让散点图使用地图坐标系统
        })
        legendArr.push(this.data[i].name)
      }
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.echartsInst.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.map.offsetWidth / 100 * 3.6
      // 根据目前分辨率设置配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          // 控制图例中的圆点
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          // 控制图例间的间隔
          itemGap: titleFontSize / 2,
          // 控制图例中的文字
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.echartsInst.setOption(adapterOption)
      // 调用了resize才能实现整个图表的适配
      this.echartsInst.resize()
    },
    backToChinaMap () {
      const option = {
        geo: {
          map: 'china'
        }
      }
      this.echartsInst.setOption(option)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    // 主题切换
    theme () {
      this.echartsInst.dispose() // 销毁当前图表
      this.initChart()
      this.screenAdapter()
      this.updateChart()
      if (this.theme === 'chalk') {
        const option = {
          geo: {
            itemStyle: {
              // 将地图调成暗色模式
              areaColor: '#2E72BF',
              borderColor: '#333'
            }
          }
        }
        this.echartsInst.setOption(option)
      }
    }
  }
}
</script>

<style>
</style>
