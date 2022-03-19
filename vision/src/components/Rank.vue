<template>
  <div class="com-container">
    <div class="com-chart" ref="rank"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      echartsInst: null,
      data: null,
      startValue: 0,
      endValue: 9,
      timerId: null
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    // 挂载的时候也要调用一下
    this.screenAdapter()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
  },
  methods: {
    initChart () {
      // 初始化同时设置echarts主题
      this.echartsInst = this.$echarts.init(this.$refs.rank, this.theme)
      const initOption = {
        title: {
          text: '▌ 地区销量排行',
          left: 20,
          top: 20
        },
        // 调整坐标轴位置
        grid: {
          top: '30%',
          bottom: '5%',
          containLabel: true
        },
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        tooltip: {},
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              textStyle: {
                color: 'white'
              }
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
    async getData () {
      // axios返回的数据是一个promise对象
      // 解构赋值获取返回的对象中的data项
      const { data: ret } = await this.$http.get('rank')
      this.data = ret
      // 将数据从大到小排序
      this.data.sort((a, b) => b.value - a.value)
      this.updateChart()
      this.setTimer()
    },
    updateChart () {
      const colorArr = [
        ['#0BA82C', '#4FF778'],
        ['#2E72BF', '#23E5E5'],
        ['#5052EE', '#AB6EE5']
      ]
      const provinces = []
      const values = []
      for (let i = 0; i < this.data.length; i++) {
        provinces.push(this.data[i].name)
        values.push(this.data[i].value)
      }
      const dataOption = {
        xAxis: { data: provinces },
        // 实现平移动画
        dataZoom: {
          show: false, // 隐藏dataZoom栏
          startValue: this.startValue,
          endValue: this.endValue
        },
        series: [
          {
            data: values,
            // 设置柱的颜色
            itemStyle: {
              // color值可以设置为函数
              color: arg => {
                let targetColorArr = []
                // 不同值不同颜色
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                // 设置颜色渐变
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ]
      }
      this.echartsInst.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.rank.offsetWidth / 100 * 3.6
      // 根据目前分辨率设置配置项
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
            }
          }
        ]
      }
      this.echartsInst.setOption(adapterOption)
      // 调用了resize才能实现整个图表的适配
      this.echartsInst.resize()
    },
    setTimer () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.startValue++
        this.endValue++
        if (this.endValue > this.data.length - 1) {
          this.startValue = 0
          this.endValue = 9
        }
        this.updateChart()
      }, 2000)
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
    }
  }
}
</script>

<style>
</style>
