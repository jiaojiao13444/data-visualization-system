<template>
  <div class="com-container">
    <div class="com-chart" ref='stock'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      echartsInst: null,
      data: null,
      timerId: null,
      currentIndex: 0,
      color: '#eeeeee' // 圆环颜色
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdapter)
    clearInterval(this.timerId)
  },
  methods: {
    initChart () {
      this.echartsInst = this.$echarts.init(this.$refs.stock, this.theme)
      const initOption = {
        title: {
          text: '▌ 库存与销量统计',
          left: 20,
          top: 20
        }
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
      const { data: ret } = await this.$http.get('stock')
      this.data = ret
      this.updateChart()
      this.setTimer()
      this.screenAdapter()
    },
    updateChart () {
      // PS要是发现某处往下的代码没有高亮了，说明这里写错了
      // 每个饼的圆心
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      // 一次只展示五个数据，slice取头不取尾
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const shownData = this.data.slice(start, end)
      const seriesArr = shownData.map((item, index) => {
        // 返回的每个对象都是一个饼图
        return {
          type: 'pie',
          center: centerArr[index],
          // 这些不能写在initOption中，因为这是每个饼图都要单独配置的
          hoverAnimation: false, // 取消鼠标悬浮动画
          labelLine: {
            show: false // 移除标签的指示线
          },
          // 将标签移到中心位置
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          // 两部分的数据
          data: [
            {
              // 设置标签
              name: item.name + '\n\n销量：' + item.sales,
              value: item.sales,
              itemStyle: {
                // 设置渐变色，渐变方向从右往左
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: this.color
              }
            }
          ]
        }
      })
      const dataOption = {
        series: seriesArr
      }
      this.echartsInst.setOption(dataOption)
    },
    screenAdapter () {
      const titleFontSize = this.$refs.stock.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        label: {
          fontSize: titleFontSize / 2
        },
        // 有五个圆环，所以要设置五次
        series: [
          {
            radius: [titleFontSize * 2.7, titleFontSize * 3.0]
          },
          {
            radius: [titleFontSize * 2.7, titleFontSize * 3.0]
          },
          {
            radius: [titleFontSize * 2.7, titleFontSize * 3.0]
          },
          {
            radius: [titleFontSize * 2.7, titleFontSize * 3.0]
          },
          {
            radius: [titleFontSize * 2.7, titleFontSize * 3.0]
          }
        ]
      }
      this.echartsInst.setOption(adapterOption)
      this.echartsInst.resize()
    },
    setTimer () {
      if (this.timerId) {
        clearInterval(this.timerId)
      }
      this.timerId = setInterval(() => {
        this.currentIndex++
        if (this.currentIndex > 1) {
          this.currentIndex = 0
        }
        this.updateChart()
        this.screenAdapter()
      }, 5000)
    }
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    // 主题切换
    theme () {
      this.echartsInst.dispose() // 销毁当前图表
      if (this.theme === 'chalk') {
        this.color = '#333843'
      } else {
        this.color = '#eeeeee'
      }
      this.initChart()
      this.updateChart()
      this.screenAdapter()
    }
  }
}
</script>

<style>
</style>
