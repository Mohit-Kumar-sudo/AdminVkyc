import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { OrgGridType } from './org-grid-data';
declare var OrgChart;

@Component({
  selector: 'app-tree-grid',
  templateUrl: './tree-grid.component.html',
  styleUrls: ['./tree-grid.component.scss']
})
export class TreeGridComponent implements OnInit, AfterViewInit {
  borderColor = "lightblue";

  @Input()
  data: OrgGridType[];

  exposedChart: any;

  constructor() { }

  ngOnInit() {

  }

  initializeChart() {
    setTimeout(() => {

      var editForm = function () {
        this.nodeId = null;
      };

      editForm.prototype.init = function (obj) {
        var that = this;
        this.obj = obj;
        this.editForm = document.getElementById("editForm");
        this.nameInput = document.getElementById("name");
        this.cancelButton = document.getElementById("cancel");
        this.saveButton = document.getElementById("save");

        this.cancelButton.addEventListener("click", function () {
          that.hide();
        });

        this.saveButton.addEventListener("click", () => {
          var node = chart.get(that.nodeId);
          node.name = that.nameInput.value;

          chart.updateNode(node);
          that.hide();
        });
      };

      editForm.prototype.show = function (nodeId) {
        this.nodeId = nodeId;
        var left = document.body.offsetWidth / 2 - 150;
        this.editForm.style.display = "block";
        this.editForm.style.left = left + "px";
        var node = chart.get(nodeId);
        this.nameInput.value = (node.name) ? node.name : "Segment Name";
        this.nameInput.focus();
        this.nameInput.select();
      };

      editForm.prototype.hide = function (showldUpdateTheNode) {
        this.editForm.style.display = "none";
      };

      let chart = new OrgChart(document.getElementById("treeView"), {
        sticky: false,
        // orientation: OrgChart.orientation.left,
        // scaleInitial: OrgChart.match.boundary,
        scaleMin: 0.2,
        template: "ana",
        enableSearch: false,
        mouseScrool: OrgChart.action.none,
        nodeMouseClick: OrgChart.action.edit,
        toolbar: {
          // layout: true,
          zoom: true,
          fit: true,
          expandAll: false
        },
        menu: {
          pdf: { text: "Export PDF" },
          png: { text: "Export PNG" },
          //svg: { text: "Export SVG" },
          //csv: { text: "Export CSV" }
        },
        editUI: new editForm(),
        nodeMenu: {
          edit: { text: "Edit" },
          add: { text: "Add" },
          remove: { text: "Remove" }
        },
        nodeBinding: {
          field_0: "name",
        },
        nodes: this.data,
        onAdd: function (sender, node) {
          node.name = "Segment Name"
        },
        onClick: function (sender, node) {
          // chart.fit();
        },
        onExpCollClick: function (sender, action, id, ids) {
          // chart.fit();
        },
      });

      this.exposedChart = chart;
    }, 0);
  }

  updateComponent(nodes) {
    this.data = nodes;
    this.initializeChart();
  }

  getData() {
    return this.exposedChart.config.nodes;
  }
  ngAfterViewInit(): void {
    // console.log(this.chart);
    // if (this.chart) {
    //   console.log(this.chart);
    //   this.chart.draw(OrgChart.action.init);
    // }
  }

}
