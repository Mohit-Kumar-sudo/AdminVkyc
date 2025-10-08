import { Component, ViewChild } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from '../../services/api/api.service';
import { FileService } from '../../services/file/file.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  p: number = 1;
  itemsPerPage: number = 10;
  env: any;
  selectedTeam: any = {}; 
  getData: any;
  myForm!: FormGroup;
  teamToDeleteId: string | null = null;  
  image: File[] = [];
  collection: any = []; 


    @ViewChild('confirmDeleteModal') confirmDeleteModal: any;
data: any;
  constructor(
    private teamService: ApiService, 
    private fb: FormBuilder,
    private modalService: NgbModal,
    private fileServ : FileService
  ) {
    this.env = environment.url
    this.myForm = this.fb.group({
      image: [null],
      name: ['' ],
      designation: [''],
      detail: [''],
    });
    for (let i = 1; i <= 100; i++) {
      this.collection.push(`item ${i}`);
    }
  }

  ngOnInit() {
    this.fetchAllTeams();
  }

    fetchAllTeams() {
    this.teamService.get('teams',{}).subscribe(res => {
      this.getData = res;
      console.log(this.getData.length)
    });
  }

  getSNo(index: number): number {
    return (this.p - 1) * this.itemsPerPage + index + 1;
  }

  editTeam(team: any, content: any) {
    this.selectedTeam = { ...team }; 
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  onDelete(id: any) {
    this.teamToDeleteId = id;  
    const modalRef = this.modalService.open(this.confirmDeleteModal, { ariaLabelledBy: 'modal-basic-title' });
    modalRef.result.then((result) => {
      if (result === 'Delete' && this.teamToDeleteId) {
        this.teamService.delete('teams',this.teamToDeleteId).subscribe(res => {
          console.log(res);
          this.fetchAllTeams();
        });
      }
    });
  }

  confirmDelete(modal: any) {
    modal.close('Delete'); 
  }

  onDeleteAll() {
    // this._blogService.onBlogDeleteAll().subscribe(res => {
    //   console.log('All Blogs deleted', res);
    //   this.fetchAllBlogs(); // Refresh the blog list after deleting all
    // });
  }

  // saveChanges(modal: any) {
  // }

  handleFileInput(event: any) {
    this.selectedTeam.image = event.target.files[0]; 
  }

  onSelect(event: any): void {
    const file: File = event.addedFiles[0];
    if (file) {
      this.image = [file];
      this.myForm.patchValue({ image: file });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  onRemove(file: File): void {
    if (this.image.includes(file)) {
      this.image = [];
      this.myForm.patchValue({ image: null });
      this.myForm.get('image')?.updateValueAndValidity();
    }
  }

  uploadImage(modal:any) {
    if (this.image.length > 0) {
      this.fileServ.uploadFile(this.image[0]).subscribe(
        (res: any) => {
          if (res.type === HttpEventType.Response) {
            const body: any = res.body;
            const imagePath = body.file.path;
            this.selectedTeam.image = imagePath;
            console.log('teams', this.selectedTeam)
            this.teamService.put('teams',this.selectedTeam._id, this.selectedTeam).subscribe(res => {
              this.fetchAllTeams();
              modal.close(); 
            });
          }
        },
        (error) => {
          alert(`Error uploading image: ${error.message}`);
        }
      );
    } else {
      alert('Please Select Image');
    }
  }

}
