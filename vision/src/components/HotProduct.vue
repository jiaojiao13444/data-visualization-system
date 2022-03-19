<template>
  <div class="com-container">
    <!-- 动态设置行内样式一定要记得加上：绑定！ -->
    <span class="leftArrow" :style="style" v-show="showLeft" @click = 'back'>＜</span>
    <span class="rightArrow" :style="style" v-show="showRight" @click = 'forward'>＞</span>
    <span class="categoryName" :style="style">{{catName}}</span>
    <div class="com-chart" ref='hotproduct'></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getThemeValue } from '@/utils/theme_utils'
export default {
  data () {
    return {
      echartsInst: null,
      data: null,
      currentIndex: 0, // 目前显示的大类图表的索引值
      showLeft: false,
      showRight: true,
      titleFontSize: 0
    }
  },
  mounted () {
    this.initChart()
    this.getData()
    // 绑定事件的时候绑定的函数一定不要加小括号！！自动补全害人呜呜呜
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.screenAdapter)
  },
  computed: {
    // 必须要写这个计算属性而不能直接写上data[this.currentIndex].name，否则控制台一片飘红
    catName () {
      if (this.data) {
        return this.data[this.currentIndex].name
      } else {
        return ''
      }
    },
    // 调整箭头和品类名的大小
    style () {
      // 注意fontSize的写法，以及不要忘记加px!!!
      return {
        fontSize: this.titleFontSize + 'px',
        color: getThemeValue(this.theme).titleColor
      }
    },
    // 可将state中的数据映射为计算属性，使用起来更加方便
    ...mapState(['theme'])
  },
  methods: {
    initChart () {
      this.echartsInst = this.$echarts.init(this.$refs.hotproduct, this.theme)
      const initOption = {
        title: {
          text: '▌ 热销商品销售占比统计',
          left: 20,
          top: 20
        },
        legend: {
          top: '13%',
          icon: 'circle'
        },
        tooltip: {
          // formatter可以设置提示框中的内容
          formatter: target => {
            let ret = ''
            target.data.children.map(item => {
              const percentage = Math.round((item.value / target.value) * 100)
              // 使用br标签换行
              ret += `${item.name}: ${percentage}%<br>`
            })
            return ret
          }
        },
        series: [
          {
            type: 'pie'
          }
        ]
      }
      this.echartsInst.setOption(initOption)
    },
    async getData () {
      const { data: ret } = await this.$http.get('hotproduct')
      this.data = ret
      this.updateChart()
    },
    updateChart () {
      const dataOption = {
        legend: {
          data: this.data[this.currentIndex].children
        },
        series: [
          {
            data: this.data[this.currentIndex].children
          }
        ]
      }
      this.echartsInst.setOption(dataOption)
    },
    screenAdapter () {
      this.titleFontSize = this.$refs.hotproduct.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            // 调整饼图半径
            radius: this.titleFontSize * 4.5,
            // 设置饼图圆心
            center: ['50%', '63%']
          }
        ]
      }
      this.echartsInst.setOption(adapterOption)
      this.echartsInst.resize()
    },
    back () {
      if (this.currentIndex === 2) {
        this.currentIndex--
        this.showRight = true
      } else if (this.currentIndex === 1) {
        this.currentIndex--
        this.showLeft = false
      }
      this.updateChart()
    },
    forward () {
      if (this.currentIndex === 1) {
        this.currentIndex++
        this.showRight = false
      } else if (this.currentIndex === 0) {
        this.currentIndex++
        this.showLeft = true
      }
      this.updateChart()
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

<style scoped="scoped">
.leftArrow, .rightArrow {
  position: absolute;
  top: 50%;
  z-index: 1;
  color: white;
  cursor: pointer;
}
.leftArrow {
  left: 15%;
}
.rightArrow {
  right: 15%;
}
.categoryName {
  position: absolute;
  bottom: 10%;
  right: 15%;
  z-index: 1;
  color: white;
}
</style>
