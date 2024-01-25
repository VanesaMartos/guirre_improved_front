import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from 'src/app/core/models/article.interface';
import { User } from 'src/app/core/models/user.interface';
import { ArticlesService } from 'src/app/core/services/articles.service';
import { SubscribersService } from 'src/app/core/services/subscribers.service';
import { UsersService } from 'src/app/core/services/users.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-assignment',
  templateUrl: './form-assignment.component.html',
  styleUrls: ['./form-assignment.component.css']
})
export class FormAssignmentComponent {

  newAssignment: FormGroup;
  articleId: string = '';
  userInfo!: User;
  articleInfo!: Article;
  allEditors: User[] = [];
  allWriters: User[] = [];
  showAssignDiv: boolean = false;
  showPublishDiv: boolean = false;

  articlesService = inject(ArticlesService);
  usersService = inject(UsersService);
  subscribersService = inject(SubscribersService);
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);


  constructor() {
    this.newAssignment = new FormGroup({
      user_id: new FormControl(''),
      articles_id: new FormControl(),
      comments: new FormControl(),
      actual_status: new FormControl(['revision']),
      headline: new FormControl(0)
    }, [])
  }

  async ngOnInit() {
    this.userInfo = await this.usersService.getById();
    this.allEditors = await this.usersService.getByRole('editor');
    this.allWriters = await this.usersService.getByRole('redactor');

    this.activatedRoute.params.subscribe(async params => {
      this.articleId = params['articleId'];
      const response = await this.articlesService.getById(this.articleId);
      const { id } = response;
      this.newAssignment.patchValue({ articles_id: id, user_id: this.userInfo.id });
    })

    this.articleInfo = await this.articlesService.getById(this.articleId);

  }

  onClick($event: any) {
    if ($event.target.value === "0: 'borrador'") {
      this.showAssignDiv = true;
      this.showPublishDiv = false;
    } else if ($event.target.value === "1: 'publicado'") {
      this.showPublishDiv = true;
      this.showAssignDiv = false;
    }
  }

  onCheck($event: any) {
    this.newAssignment.value.headline = 1;
  }

  isDisabled() {
    if (this.showPublishDiv) {
      return false;
    }
    if (this.showAssignDiv) {
      if (this.newAssignment.value.user_id !== this.userInfo.id) {
        return false;
      }
    }
    return true;
  }

  isDisableAssign() {
    if (this.newAssignment.value.user_id !== this.userInfo.id) {
      return false;
    }
    return true
  }

  async onSubmit() {
    try {
      this.newAssignment.value.actual_status = this.newAssignment.value.actual_status[0];
      const response = await this.articlesService.assignArticle(this.articleId, this.newAssignment.value);

      await Swal.fire({
        icon: "success",
        title: "Operación realizada con éxito",
        showConfirmButton: false,
        timer: 1500
      });

      this.router.navigate(['/area-personal/articulos']);
    } catch (e: any) {
      console.log(e);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error durante la operación'
      });
    }
  }


}
