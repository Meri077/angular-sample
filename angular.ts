import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import Parse from 'src/app/configs/parseSdk';
import {FormationService} from '../../../services/formations/formation.service';
import {UserService} from '../../../services/user/user.service'
@Component({
  selector: 'app-formations-modal',
  templateUrl: './formations-modal.component.html',
  styleUrls: ['./formations-modal.component.scss']
})
export class FormationsModalComponent implements OnInit {
  @Output() showModalF: EventEmitter<any> = new EventEmitter();
  reg = '^(http[s]?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
  public formationFrom: FormGroup = new FormGroup({
    title:  new FormControl('', [Validators.required, Validators.maxLength(25)]),
    author: new FormControl('', Validators.required),
    link:   new FormControl('', [Validators.required, Validators.pattern(this.reg)]),
  });
  public power: number;
  public activeFire: boolean = false;
  constructor(
    private formationService: FormationService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }
  get m(){
    return this.formationFrom.controls;
  }
  hideFormationModal(e: any, close = false) {
    if (!e.target.closest('.add-formation') || close) {
      this.showModalF.emit()
    }
  }
  onPower(power: number) {
    this.power = power
    this.activeFire = true
  }
  async onSaveFormation(e:any) {
    const userFormations = Parse.User.current().get('formations')
    const formationFrom = this.formationFrom.value
    this.formationService.getFormationById(formationFrom.link).then(formation => {
      if (formation) {
        const userId = formation.get("students").filter(user => user.id === Parse.User.current().id);
        if (userId.length >= 1) {
          this.showModalF.emit()
          return
        } else {
          this.formationService.updateStudents(formation).then(value => {
            const userData = {
              id: value?.id,
              power: this.power,
              isVisible: true
            }
            if (userFormations === undefined) {
              this.userService.setUserField({fieldName: "formations", fieldValue: [userData]})
              this.userService.updateUser()
            } else {
              userFormations.push(userData)
              this.userService.setUserField({fieldName: "formations", fieldValue: userFormations})
              this.userService.updateUser()
            }
          }, reason => {
            console.log("ErrorIs003", reason)
          })
        }
      } else {
        this.formationService.saveFormation(formationFrom).then(value => {
          const userData = {
            id: value?.id,
            power: this.power,
            isVisible: true
          }
          if (userFormations === undefined) {
            this.userService.setUserField({fieldName: "formations", fieldValue: [userData]})
            this.userService.updateUser()
          } else {
            userFormations.push(userData)
            this.userService.setUserField({fieldName: "formations", fieldValue: userFormations})
            this.userService.updateUser()
          }
        }, reason => {
          console.log("ErrorIs002", reason)
        })
      }
    }, reason => {
      console.log("ErrorIs001", reason)
    })
    this.hideFormationModal(e, true)
    setTimeout(()=>this.formationService.getAllFormation(),1000)
    return
  }
}

