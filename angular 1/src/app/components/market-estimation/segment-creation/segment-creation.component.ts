import {Component, OnInit, ViewChild} from '@angular/core';
import {TreeGridComponent} from '../../core/tree-grid/tree-grid.component';
import {SegmentNode, MasterReportData} from 'src/app/models/me-models';
import {Location} from '@angular/common';
import {Router} from '@angular/router';
import {ConstantKeys} from '../../../constants/mfr.constants';
import {LocalStorageService} from 'src/app/services/localsotrage.service';
import {ReportService} from 'src/app/services/report.service';
import {SegmentService} from 'src/app/services/segment.service';
import {MatSnackBar, MatDialog} from '@angular/material';
import {MasterReportDataSegment} from 'src/app/models/segment-models';

declare var $: any;
// import * as html2canvas from 'html2canvas';
declare var JSONLoop: any;
import * as _ from 'lodash';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-segment-creation',
  templateUrl: './segment-creation.component.html',
  styleUrls: ['./segment-creation.component.scss']
})
export class SegmentCreationComponent implements OnInit {

  @ViewChild(TreeGridComponent)
  treeGridComponent: TreeGridComponent;

  currentReport: MasterReportData = null;

  segmentData: any = [];
  bifurcationLevel: any = 1;
  orgData: any = [];
  disableBtn: boolean;
  finalData: any = [];

  constructor(private localStorageService: LocalStorageService,
              private segmentService: SegmentService,
              private spinner: NgxSpinnerService,
              private router: Router,
              private reportService: ReportService,
              private _location: Location,
              private _snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.spinner.show();
    this.currentReport = this.localStorageService.get(ConstantKeys.CURRENT_REPORT);
    this.getFormInfo();
  }

  getFormInfo() {
    this.segmentService.getReportInfoByKey(this.currentReport._id, 'me,title').subscribe(
      data => {
        this.getFormInfoSuccess(data);
      },
      error => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getFormInfoSuccess(data: any) {
    this.segmentData = [];
    if (data && data.me && data.me.segment && data.me.segment.length > 0) {
      this.segmentData = data.me.segment;
      if (data.me.bifurcationLevel) {
        this.bifurcationLevel = data.me.bifurcationLevel;
      }
    }
    this.orgCharts();
    this.spinner.hide();
  }

  getUpdatedGraph(nodes) {
    this.treeGridComponent.updateComponent(nodes);
  }

  toPreviousPage() {
    this._location.back();
  }

  loadTableGrid() {
    this.spinner.show();
    this.orgData.map(d => {
      if (d.children) {
        delete d.children;
      }
    });

    _.remove(this.orgData, function(n) {
      if (n.level > 5) {
        return n;
      }
    });

    this.orgData.map(d => {
      let obj = {
        pid: d.parentId,
        id: d.id,
        name: d.name,
      };
      this.finalData.push(obj);
    });
    this.segmentService.saveSegmentInfo(this.currentReport._id, {
      segmentData: this.finalData,
      bifurcationLevel: this.bifurcationLevel
    }).subscribe(
      resp => {
        this._snackBar.open('Segment Information Saved successfully', 'Close', {
          duration: 2000,
        });
        this.router.navigateByUrl(`/me-report/${this.currentReport._id}/global-info/market-estimation/me-grid`);
      },
      err => {
        this.spinner.hide();
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Segment information', 'Close', {
          duration: 2000,
        });
      }
    );
  }

  orgCharts() {
    let temp = []
    let temp2 = []
    let temporaryThis = this;
    let parent_id: string;
    let deleteId: any = [];
    let tempOrgData = this.segmentData;
    (function($, JSONLoop) {

      $(function() {

        var datasource = {
          'name': temporaryThis.currentReport.title,
          'id': '1',
          parentId: null,
          relationship: null,
        };
        temporaryThis.segmentData.forEach(function(item, index) {
          if (!item.pid) {
            delete item.pid;
            Object.assign(datasource, item);
          } else {
            var jsonloop = new JSONLoop(datasource, 'id', 'children');
            jsonloop.findNodeById(datasource, item.pid, function(err, node) {
              if (err) {
                console.error(err);
              } else {
                // temp.push(item)
                // _.filter(_.uniq(_.map(temp, (items) => {
                //   if (_.filter(temp, { name: items.name }).length > 1) {
                //     let parents = _.find([node], ['id', item.pid])
                //     if (parents) {
                //       item.name = parents.name + '_' + items.name
                //     }
                //   }
                // })));
                delete item.pid;
                if (node.children) {
                  node.children.push(item);
                  var b = 2;
                } else {
                  node.children = [item];
                  var a = 1;
                }
              }
            });
          }
        });
        var getId = function() {
          return (new Date().getTime()) * 1000 + Math.floor(Math.random() * 1001);
        };

        var oc = $('#input-org-chart-container').orgchart({
          'data': datasource,
          'visibleLevel': 5,
          'chartClass': 'edit-state',
          'exportButton': false,
          'exportFilename': 'SportsChart',
          'parentNodeSymbol': 'fa-th-large',
          'pan': 'true',
          'zoom': 'true',
          'createNode': function($node, data) {
            $node[0].id = getId();
            $node.on('click', function() {
              deleteId = [];
              parent_id = data.id;
              if (data.children) {
                temporaryThis.disableBtn = true;
                data.children.forEach(item => {
                  deleteId.push(item.id);
                });
                deleteId.push(data.id);
              } else {
                temporaryThis.disableBtn = false;
                deleteId.push(data.id);
              }
            });
            temp2.push(data)
            _.filter(_.uniq(_.map(temp2, (item) => {
              if (_.filter(temp2, { name: item.name }).length > 1) {
                let parents = _.find(temporaryThis.orgData, ['id', data.parentId])
                data.name = parents.name + '_' + item.name
              }
            })));
            temporaryThis.orgData.push(data);
          }

        });

        oc.$chartContainer.on('click', '.node', function() {
          var $this = $(this);
          $('#selected-node').val($this.find('.title').text()).data('node', $this);
        });

        oc.$chartContainer.on('click', '.orgchart', function(event) {
          if (!$(event.target).closest('.node').length) {
            $('#selected-node').val('');
          }
        });

        $('input[name="chart-state"]').on('click', function() {
          $('.orgchart').toggleClass('edit-state', this.value !== 'view');
          $('#edit-panel').toggleClass('edit-state', this.value === 'view');
          if ($(this).val() === 'edit') {
            $('.orgchart').find('tr').removeClass('hidden')
              .find('td').removeClass('hidden')
              .find('.node').removeClass('slide-up slide-down slide-right slide-left');
          } else {
            $('#btn-reset').trigger('click');
          }
        });

        $('input[name="node-type"]').on('click', function() {
          var $this = $(this);
          if ($this.val() === 'parent') {
            $('#edit-panel').addClass('edit-parent-node');
            $('#new-nodelist').children(':gt(0)').remove();
          } else {
            $('#edit-panel').removeClass('edit-parent-node');
          }
        });

        $('#btn-add-input').on('click', function() {
          $('#new-nodelist').append('<li><input type="text" class="new-node"></li>');
        });

        $('#btn-remove-input').on('click', function() {
          var inputs = $('#new-nodelist').children('li');
          if (inputs.length > 1) {
            inputs.last().remove();
          }
        });

        $('#btn-add-nodes').on('click', function() {
          _.remove(temporaryThis.orgData, function(n) {
            if (n.level > 5) {
              return n;
            }
          });
          var $chartContainer = $('#input-chart-container');
          var nodeVals = [];
          let spCheck
          $('#new-nodelist').find('.new-node').each(function(index, item) {
            var validVal = item.value.trim();
            if(validVal)
              nodeVals.push(validVal);
          });
          var $node = $('#selected-node').data('node');
          if (!nodeVals.length) {
            alert('Please input value for new node');
            return;
          }
          var nodeType = $('input[name="node-type"]:checked');
          if (!nodeType.length) {
            alert('Please select a node type');
            return;
          }
          if (nodeType.val() !== 'parent' && !$('.orgchart').length) {
            alert('Please creat the root node firstly when you want to build up the orgchart from the scratch');
            return;
          }
          if (nodeType.val() !== 'parent' && !$node) {
            alert('Please select one node in orgchart');
            return;
          }
          if (nodeType.val() === 'parent') {
            if (!$chartContainer.children('.orgchart').length) {// if the original chart has been deleted
              oc = $chartContainer.orgchart({
                'data': {'name': nodeVals[0]},
                'exportButton': true,
                'exportFilename': 'SportsChart',
                'parentNodeSymbol': 'fa-th-large',
                'createNode': function($node, data) {
                  $node[0].id = getId();
                }
              });
              oc.$chart.addClass('view-state');
            } else {
              oc.addParent($chartContainer.find('.node:first'), {'name': nodeVals[0], 'id': getId()});
            }
          } else if (nodeType.val() === 'siblings') {
            if ($node[0].id === oc.$chart.find('.node:first')[0].id) {
              alert('You are not allowed to directly add sibling nodes to root node');
              return;
            }
            oc.addSiblings($node, nodeVals.map(function(item) {
              return {'id': getId().toString(), 'name': item, 'relationship': '110', 'parentId': parent_id, 'level': 1};
            }));
          } else {
            var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
            if (!hasChild) {
              oc.addChildren($node, nodeVals.map(function(item) {
                return {'id': getId().toString(), 'name': item, 'relationship': '100', 'parentId': parent_id, 'level': 1};
              }));
            } else {
              oc.addSiblings($node.closest('tr').siblings('.nodes').find('.node:first'), nodeVals.map(function(item) {
                return {'id': getId().toString(), 'name': item, 'relationship': '110', 'parentId': parent_id, 'level': 1};
              }));
            }
          }
        });

        $('#btn-delete-nodes').on('click', function(data) {
          var $node = $('#selected-node').data('node');
          if (!$node) {
            alert('Please select one node in orgchart');
            return;
          } else if ($node) {
            if (!window.confirm('Are you sure you want to delete the node?')) {
              return;
            }
          } else if ($node[0] === $('.orgchart').find('.node:first')[0]) {
            if (!window.confirm('Are you sure you want to delete the whole chart?')) {
              return;
            }
          }

          deleteId.forEach(i => {
            _.remove(temporaryThis.orgData, function(n) {
              return n.id === i;
            });
            _.remove(temp2,(n)=>{
              return n.id === i
            })
          });
          oc.removeNodes($node);

          $('#selected-node').val('').data('node', null);
        });

        $('#btn-reset').on('click', function() {
          $('.orgchart').find('.focused').removeClass('focused');
          $('#selected-node').val('');
          $('#new-nodelist').find('input:first').val('').parent().siblings().remove();
          $('#node-type-panel').find('input').prop('checked', false);
        });
      });

    })($, JSONLoop);
  }
}
