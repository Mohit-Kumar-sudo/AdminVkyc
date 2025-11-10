import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TreeGridComponent } from '../../core/tree-grid/tree-grid.component';
import { SegmentNode } from 'src/app/models/me-models';
import { Location } from '@angular/common';
import { ConstantKeys } from 'src/app/constants/mfr.constants';
import { LocalStorageService } from 'src/app/services/localsotrage.service';
import { MatSnackBar } from '@angular/material';
import { CompanyProfile, ProductOfferingNode } from 'src/app/models/company-profile-model';
import { CompanyProfileService } from 'src/app/services/company-profile.service';
declare var $: any;
// import * as html2canvas from 'html2canvas';
declare var JSONLoop: any;
import * as _ from 'lodash';

@Component({
  selector: 'app-product-offering',
  templateUrl: './product-offering.component.html',
  styleUrls: ['./product-offering.component.scss']
})
export class ProductOfferingComponent implements OnInit {

  @ViewChild(TreeGridComponent)
  treeGridComponent: TreeGridComponent;

  currentCompany: CompanyProfile;

  segmentData: any = [];
  orgData: any = []

  constructor(private localStorageService: LocalStorageService,
    private companyProfileService: CompanyProfileService,
    private _location: Location,
    private _snackBar: MatSnackBar) { }

  ngOnInit() {
    $.ready;
    this.currentCompany = this.localStorageService.get(ConstantKeys.CURRENT_SELECTED_COMPANY_PROFILE_INFO);
    this.getFormInfo();
  }

  getFormInfo() {
    this.companyProfileService.getSecondaryDetailsByKey(this.currentCompany._id, ConstantKeys.PRODUCT_OFFERING_SECTION_KEY).subscribe(
      data => {
        this.getFormInfoSuccess(data);
      },
      error => {
        console.log(error);
      }
    );
  }

  getFormInfoSuccess(data) {
    this.segmentData = [];
    if (data && data.length > 0) {
      data.forEach(ele => {
        this.segmentData.push(ele);
      });
    }
    // else {
    //   var emptyNode: SegmentNode = {
    //     id: 1,
    //     parentId: null,
    //     name: 'Name',
    //   };
    //   this.segmentData.push(emptyNode);
    // }
    // this.getUpdatedGraph(this.segmentData);
    this.orgCharts()
  }

  getUpdatedGraph(nodes) {
    this.treeGridComponent.updateComponent(nodes);
  }

  toPreviousPage() {
    this._location.back();
  }

  onSubmitInfo() {
    // let productOffering = this.treeGridComponent.getData() as ProductOfferingNode[];

    this.orgData.map(d => {
      if (d.children) {
        delete d.children
      }
    })

    this.companyProfileService.saveCompanyProductOffering(this.currentCompany._id, this.orgData).subscribe(
      resp => {
        this._snackBar.open('Company Produce Offering saved successfully', 'Close', {
          duration: 2000,
        });
      },
      err => {
        // ENHANCE: Read ERR & show data
        this._snackBar.open('Error occured while saving Company Produce Offering', 'Close', {
          duration: 2000,
        });
      }
    );
  }

  //new org-chart methods
  orgCharts() {
    let temporaryThis = this;
    let parent_id: string;
    let deleteId: any = [];
    let tempOrgData = this.segmentData;
    (function ($, JSONLoop) {

      $(function () {

        var datasource = {
          'name': temporaryThis.currentCompany.company_name,
          'id': '1',
          parentId: null,
          relationship: null,
          level: 0
        };
        temporaryThis.segmentData.forEach(function (item, index) {
          if (!item.parentId) {
            delete item.parentId;
            Object.assign(datasource, item);
          } else {
            var jsonloop = new JSONLoop(datasource, 'id', 'children');
            jsonloop.findNodeById(datasource, item.parentId, function (err, node) {
              if (err) {
                console.error(err);
              } else {
                delete item.parentId;
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

        var getId = function () {
          return (new Date().getTime()) * 1000 + Math.floor(Math.random() * 1001);
        };

        var oc = $('#input-chart-container').orgchart({
          'data': datasource,
          'chartClass': 'edit-state',
          'exportButton': false,
          'exportFilename': 'SportsChart',
          'parentNodeSymbol': 'fa-th-large',
          'zoom': 'true',
          'pan': 'true',
          'createNode': function ($node, data) {
            $node[0].id = getId();
            $node.on('click', function () {
              deleteId = [];
              parent_id = data.id;
              if (data.children) {
                data.children.forEach(item => {
                  deleteId.push(item.id)
                })
                deleteId.push(data.id)
              } else {
                deleteId.push(data.id)
              }
            });
            temporaryThis.orgData.push(data);
          }
        });

        oc.$chartContainer.on('click', '.node', function () {
          var $this = $(this);
          $('#selected-node').val($this.find('.title').text()).data('node', $this);
        });

        oc.$chartContainer.on('click', '.orgchart', function (event) {
          if (!$(event.target).closest('.node').length) {
            $('#selected-node').val('');
          }
        });

        $('input[name="chart-state"]').on('click', function () {
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

        $('input[name="node-type"]').on('click', function () {
          var $this = $(this);
          if ($this.val() === 'parent') {
            $('#edit-panel').addClass('edit-parent-node');
            $('#new-nodelist').children(':gt(0)').remove();
          } else {
            $('#edit-panel').removeClass('edit-parent-node');
          }
        });

        $('#btn-add-input').on('click', function () {
          $('#new-nodelist').append('<li><input type="text" class="new-node"></li>');
        });

        $('#btn-remove-input').on('click', function () {
          var inputs = $('#new-nodelist').children('li');
          if (inputs.length > 1) {
            inputs.last().remove();
          }
        });

        $('#btn-add-nodes').on('click', function () {
          var $chartContainer = $('#input-chart-container');
          var nodeVals = [];
          $('#new-nodelist').find('.new-node').each(function (index, item) {
            var validVal = item.value.trim();
            if (validVal.length) {
              nodeVals.push(validVal);
            }
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
                'data': { 'name': nodeVals[0] },
                'exportButton': true,
                'exportFilename': 'SportsChart',
                'parentNodeSymbol': 'fa-th-large',
                'createNode': function ($node, data) {
                  $node[0].id = getId();
                }
              });
              oc.$chart.addClass('view-state');
            } else {
              oc.addParent($chartContainer.find('.node:first'), { 'name': nodeVals[0], 'id': getId() });
            }
          } else if (nodeType.val() === 'siblings') {
            if ($node[0].id === oc.$chart.find('.node:first')[0].id) {
              alert('You are not allowed to directly add sibling nodes to root node');
              return;
            }
            oc.addSiblings($node, nodeVals.map(function (item) {
              return { 'id': getId().toString(), 'name': item, 'relationship': '110', 'parentId': parent_id, 'level': 1 };
            }));
          } else {
            var hasChild = $node.parent().attr('colspan') > 0 ? true : false;
            if (!hasChild) {
              oc.addChildren($node, nodeVals.map(function (item) {
                return { 'id': getId().toString(), 'name': item, 'relationship': '100', 'parentId': parent_id, 'level': 1 };
              }));
            }
            else {
              oc.addSiblings($node.closest('tr').siblings('.nodes').find('.node:first'), nodeVals.map(function (item) {
                return { 'id': getId().toString(), 'name': item, 'relationship': '110', 'parentId': parent_id, 'level': 1 };
              }));
            }
          }
        });

        $('#btn-delete-nodes').on('click', function (data) {
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
            _.remove(temporaryThis.orgData, function (n) {
              return n.id === i
            });
          })
          oc.removeNodes($node);

          $('#selected-node').val('').data('node', null);
        });

        $('#btn-reset').on('click', function () {
          $('.orgchart').find('.focused').removeClass('focused');
          $('#selected-node').val('');
          $('#new-nodelist').find('input:first').val('').parent().siblings().remove();
          $('#node-type-panel').find('input').prop('checked', false);
        });

      });

    })($, JSONLoop)
  }
}
