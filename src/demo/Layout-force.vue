<template>
  <div>
    <div ref="myPage" style="height: calc(100vh - 50px)" @click="resetPanel">
      <div>
        <el-radio-group v-model="radio">
          <el-radio label="1">输入股票代码</el-radio>
          <el-radio label="2">选择行业股票</el-radio>
        </el-radio-group>       
      </div>
      <div class="filter-container" style="margin-top: 30px;">
        <el-input v-if="radio==1" v-model="ts_code" placeholder="股票代码" style="width: 200px; margin-right: 20px;" @change="validate"/>
        <el-cascader-panel ref="cas" :key="ckey" v-if="radio==2 && (options!=null)" :options="options" :value="ts_code" @change="casValidate"></el-cascader-panel>
        <el-date-picker
          ref="date-picker"
          v-model="end_date"
          type="date"        
          placeholder="默认为今日"
          :picker-options="dateOption"
          @click="getFirstDate"
          :disabled="dis"
          >
        </el-date-picker>
        <el-button style="margin-left: 10px;" type="primary" icon="el-icon-search" @click="searchNode" :loading="fullscreenLoading">
          搜索
        </el-button>
    </div>
      <RelationGraph
        ref="seeksRelationGraph"
        :options="graphOptions"
        :on-node-click="onNodeClick"
        :on-line-click="onLineClick"
      />
    </div>
    <div v-if="isShowNodeTipsPanel&&currentNode.data.type=='Stock'" :style="{left: nodeMenuPanelPosition.x + 'px', top: nodeMenuPanelPosition.y + 'px' }" style="z-index: 999;padding:10px;background-color: #ffffff;border:#eeeeee solid 1px;box-shadow: 0px 0px 8px #cccccc;position: absolute;">
      <div style="line-height: 25px;padding-left: 10px;color: #888888;font-size: 12px;">{{currentNode.text}}</div>
      <div class="c-node-menu-item">股票代码: {{currentNode.data.ts_code}}</div>
      <div class="c-node-menu-item">行业: {{currentNode.data.industry}}</div>
      <div class="c-node-menu-item">公告日期: {{currentNode.data.ann_date}}</div>
    </div>
    <div v-if="isShowLineTipsPanel" :style="{left: lineMenuPanelPosition.x + 'px', top: lineMenuPanelPosition.y + 'px' }" style="z-index: 999;padding:10px;background-color: #ffffff;border:#eeeeee solid 1px;box-shadow: 0px 0px 8px #cccccc;position: absolute;">
      <div style="line-height: 25px;padding-left: 10px;color: #888888;font-size: 12px;">{{currentLine.data.ann_date}}</div>
      <div class="c-node-menu-item">持股占比: {{currentLine.data.hold_ratio+"%"}}</div>
      <div class="c-node-menu-item">持股量: {{currentLine.data.hold_amount}}</div>
      <div class="c-node-menu-item">是否为最新持股: {{currentLine.data.expires==99999999?"是":"否"}}</div>
    </div>
  </div>
</template>

<script>
// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
import RelationGraph from 'relation-graph';
import * as api from '@/api/request.js';
export default {
  name: "Demo",
  components: {},
  data() {
    return {
      dis:true,
      radio:"1",
      ts_code: "",
      stockObj:null,
      isShowNodeTipsPanel: false,
      isShowLineTipsPanel: false,
      fullscreenLoading: false,
      end_date:null,
      timer:null,
      firstDate:20210701,
      codeList:{},
      nodeMenuPanelPosition: { x: 0, y: 0 },
      lineMenuPanelPosition: { x: 0, y: 0 },
      currentNode: {},
      currentLine: {},
      graphOptions: {
        debug: true,
        defaultNodeBorderWidth: 0,
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultLineShape: 1,
        layouts: [
          {
            label: "自动布局",
            layoutName: "force",
            layoutClassName: "seeks-layout-force",
          },
        ],
        defaultJunctionPoint: "border",
        dateOption: {
          disabledDate: (time) => {
            return time.getFullYear()*10000 + time.getMonth()*100 + time.getDay() >= this.firstDate
          }
        },
        options:null
        // 这里可以参考"Graph 图谱"中的参数进行设置
      },
    };
  },
  created(){
    this.getOptions()
    this.getCodes()
  },
  mounted() {
    // this.getOptions()
    // this.getCodes()
    // this.showSeeksGraph();
  },

  beforeDestroy() {
    console.log("beforeDestroy stop layout");
    this.$refs.seeksRelationGraph.getInstance().stopAutoLayout();
  },
  watch:{
    ts_code(oldVal, newVal){
      this.validate()
    },
    radio(oldVal, newVal){
      this.ts_code = ""
      this.end_date = null
      this.dis = true
    }
  },
  computed: {
    dateOption(){
      return{
        disabledDate: (time) => {
          return time.getFullYear()*10000 + time.getMonth()*100 + time.getDay() <= this.firstDate
        }
      } 
    }
  },
  methods: {
    searchNode(){
      const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      let end_date = this.end_date
      if(end_date == null){
        end_date = new Date()
      }
      end_date = end_date.getFullYear()*10000 + end_date.getMonth()*100 + end_date.getDay()
      console.log('ssss',end_date)
      this.fullscreenLoading = true;
      if(this.ts_code!=""){
        api.getStockNode(this.ts_code, end_date).then(res=>{
        console.log("res",res)
        res = res.data
        let __graph_json_data = {
          rootId:this.ts_code,
          nodes:[res.stockNodeVO, ...res.holders],
          lines:res.lines
      }
      console.log(__graph_json_data)
        this.$refs.seeksRelationGraph.setJsonData(
          __graph_json_data,
          (seeksRGGraph) => {
            // 这些写上当图谱初始化完成后需要执行的代码
          }
        )
          loading.close()
        })
      }
      this.fullscreenLoading = false;
    },
    showNodeTips(nodeObject, $event) {
      this.currentNode = nodeObject;
      const _base_position = this.$refs.myPage.getBoundingClientRect();
      console.log('showNodeMenus:', $event, _base_position);
      this.isShowNodeTipsPanel = true;
      this.nodeMenuPanelPosition.x = $event.clientX - _base_position.x + 10;
      this.nodeMenuPanelPosition.y = $event.clientY - _base_position.y + 10;
    },
    hideNodeTips(nodeObject, $event) {
      this.isShowNodeTipsPanel = false;
    },
    onNodeClick(nodeObject, $event) {
      this.currentNode = nodeObject;
      const _base_position = this.$refs.myPage.getBoundingClientRect();
      this.isShowLineTipsPanel = false;
      this.isShowNodeTipsPanel = true;
      this.nodeMenuPanelPosition.x = $event.clientX - _base_position.x + 10;
      this.nodeMenuPanelPosition.y = $event.clientY - _base_position.y + 10;
      this.$refs.seeksRelationGraph.getInstance().dataUpdated();
    },
    onLineClick(lineObject, linkObject, $event) {
      this.currentLine = lineObject
      console.log(this.currentLine)
      const _base_position = this.$refs.myPage.getBoundingClientRect();
      this.isShowNodeTipsPanel = false;
      this.isShowLineTipsPanel = true;
      this.lineMenuPanelPosition.x = $event.clientX - _base_position.x + 10;
      this.lineMenuPanelPosition.y = $event.clientY - _base_position.y + 10;
      console.log(this.isShowLineTipsPanel)
      this.$refs.seeksRelationGraph.getInstance().dataUpdated();
    },
    resetPanel(){
      this.isShowNodeTipsPanel = false
      if(this.timer!=null) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.isShowLineTipsPanel = false
      }, 4000);
    },
    getFirstDate(){
      console.log(this.ts_code)
      api.getFirstDateByCode(this.ts_code).then(res=>{
        this.firstDate = res.data
      })      
    },
    getOptions(){
      api.getOptions().then(res=>{
        this.options = res.data
        this.$forceUpdate() 
      })
    },
    getCodes(){
      api.getCodes().then(res=>{
        this.codeList = res.data
      })
    },
    validate(){
      if(this.codeList.indexOf(this.ts_code)!=-1){ 
        this.dis = false
        api.getFirstDateByCode(this.ts_code).then(res=>{
        this.firstDate = res.data
        // this.dateOption =  {
        //   disabledDate: (time) => {
        //     return time.getFullYear()*10000 + time.getMonth()*100 + time.getDay() >= this.firstDate
        //   }
        // }
      })
    }
    },
    casValidate(){
      this.ts_code = this.$refs.cas.getCheckedNodes()[0].pathLabels[1]
      console.log(this.ts_code)
      
      if(this.codeList.indexOf(this.ts_code)!=-1){ 
        api.getFirstDateByCode(this.ts_code).then(res=>{
          this.firstDate = res.data
          // this.dateOption =  {
          // disabledDate: (time) => {
          //   return time.getFullYear()*10000 + time.getMonth()*100 + time.getDay() >= this.firstDate
          // }
          // }
          this.dis = false
        })  
      }
    }
  },
};
</script>

<style lang="scss">
</style>

<style lang="scss" scoped>
.c-node-menu-item{
  line-height: 30px;padding-left: 10px;cursor: pointer;color: #444444;font-size: 14px;border-top:#efefef solid 1px;
}
.c-node-menu-item:hover{
  background-color: rgba(66,187,66,0.2);
}
</style>