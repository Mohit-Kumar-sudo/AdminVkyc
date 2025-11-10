import { Injectable } from '@angular/core';

export interface TocContent {
  id: any;
  name: any;
  level: number;
  children: any[]
}

@Injectable()
export class SharedSampleTocService {
  toc = []
  tableList = []
  figureList = []
  allTocs = []
  currentTocs = []
  cpNo = ''

  constructor() { }

  refreshService() {
    this.toc = []
    this.tableList = []
    this.figureList = []
    this.allTocs = []
    this.currentTocs = []
  }

  createChapter(sectionName) {
    let tocContent = {
      id: this.toc.length + 1,
      name: sectionName,
      level: 1,
      children: []
    }
    this.toc.push(tocContent)
    return tocContent
  }
  addChildren(children, id) {
    this.toc.find(el => el.id == id).children = children
  }
  createTableList(id, name) {
    let child = {
      id: id,
      name: name
    }
    this.tableList.push(child)
  }
  createFigureList(id, name) {
    let child = {
      id: id,
      name: name
    }
    this.figureList.push(child)
  }
  addToc(toc) {
    if (this.allTocs.length == 0) {
      this.currentTocs.push(toc)
    }
    this.allTocs.push(toc)
  }

  updateCompletedStatus() {
    let index = this.currentTocs.length;
    if (index < this.allTocs.length) {
      this.currentTocs.push(this.allTocs[index])
    }
  }
  updateCPNo(cpNo) {
    this.cpNo = cpNo;
  }
}