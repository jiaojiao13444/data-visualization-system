<template>
  <div class="com-container">
    <!-- 商家销量统计的横向柱状图 -->
    <div class="com-chart" ref='seller'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      echartsInst: null, // echarts实例对象
      data: null, // 服务器返回的数据
      currentPage: 1, // 一页展示五条数据，定义当前页
      totalPage: 0, // 一页展示五条数据，定义总页数
      timerId: null
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
    clearInterval(this.timerId)
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    // 初始化echartsInst对象
    initChart () {
      // 初始化同时设置echarts主题
      this.echartsInst = this.$echarts.init(this.$refs.seller, this.theme)
      // 配置初始化的option
      const initOption = {
        title: {
          text: '▌ 商家销售统计',
          left: 20,
          top: 20
        },
        // 调整坐标轴位置
        grid: {
          top: '20%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: { type: 'value' },
        yAxis: { type: 'category' },
        // 设置鼠标悬浮时的背景
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            z: 0
          }
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              textStyle: {
                color: 'white'
              }
            },
            itemStyle: {
              // 设置颜色渐变
              color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: '#5052EE'
                },
                {
                  offset: 1,
                  color: '#AB6EE5'
                }
              ])
            }
          }
        ]
      }
      this.echartsInst.setOption(initOption)
      // 鼠标移入图表时静止，移出时继续切换
      this.echartsInst.on('mouseover', () => {
        clearInterval(this.timerId)
      })
      this.echartsInst.on('mouseout', () => {
        this.setTimer()
      })
    },
    // 从服务器获取数据
    async getData () {
      // axios返回的数据是一个promise对象
      // 解构赋值获取返回的对象中的data项
      const { data: ret } = await this.$http.get('seller')
      this.data = ret
      // 将数据按属性值从小到大排序
      this.data.sort((a, b) => a.value - b.value)
      // 一页展示五条数据，计算总页数
      this.totalPage = Math.ceil(this.data.length / 5)
      this.updateChart()
      this.setTimer()
    },
    // 用获取到的数据更新图表
    updateChart () {
      const start = (this.currentPage - 1) * 5
      const end = this.currentPage * 5
      // slice方法取头不取尾
      const shownData = this.data.slice(start, end)
      // map方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值
      const sellerNames = shownData.map(item => item.name)
      const sellerValues = shownData.map(item => item.value)

      const dataOption = {
        yAxis: { data: sellerNames },
        series: [
          {
            data: sellerValues
          }
        ]
      }
      this.echartsInst.setOption(dataOption)
    },
    setTimer () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentPage++
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1
        }
        this.updateChart()
      }, 3000)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.seller.offsetWidth / 100 * 3.6
      // 根据目前分辨率设置配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        // 设置鼠标悬浮时的背景
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      }
      this.echartsInst.setOption(adapterOption)
      // 调用了resize才能实现整个图表的适配
      this.echartsInst.resize()
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
          tooltip: {
            axisPointer: {
              lineStyle: {
                color: '#2D3443'
              }
            }
          }
        }
        this.echartsInst.setOption(option)
      }
    }
  }
}
</script>

<style scoped>
</style>
