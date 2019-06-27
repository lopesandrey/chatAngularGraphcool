import { Component, HostBinding, OnDestroy, OnInit  } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material';

import { takeWhile } from 'rxjs/operators';
import { ErrorService } from 'src/app/core/services/error.service';
import { Router } from '@angular/router';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit , OnDestroy {

  loginForm: FormGroup;

  configs = {
    isLogin: true,
    actionText: 'SingIn',
    buttonActionText: 'Create account',
    isLoading: false
  };

  private nameControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  private alive =  true;

  @HostBinding('class.app-login-spinner') private applySpinnerClass = true;


  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private errorService: ErrorService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.createForm();

    const userData = this.authService.getRememberMe();
    if (userData) {
      this.email.setValue(userData.email);
      this.password.setValue(userData.password);
    }
  }

  createForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]]
    });
  }
  onSubmit(): void {
    this.configs.isLoading = true;

    const operation =
      (this.configs.isLogin)
        ? this.authService.signinUser(this.loginForm.value)
        : this.authService.signupUser(this.loginForm.value);

    operation
    .pipe(
      takeWhile(() => {
        return this.alive;
      })
    )
    .subscribe(
      res => {
        this.authService.setRememberMe(this.loginForm.value);
        const redirect: string = this.authService.redirectUrl  || '/dashboard';
        // redirect com o router
        console.log('redireting... ', redirect);
        this.router.navigate([redirect]);
        this.authService.redirectUrl = null;
        this.configs.isLoading = false;
      },
      error => {
        console.log(error);
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(error), 'Done', {duration: 5000, verticalPosition: 'top'});
      }
    );
  }



  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? 'SignUp' : 'SignIn';
    this.configs.buttonActionText = !this.configs.isLogin ? 'Already have account' : 'Create account';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  get name(): FormControl {
    return this.loginForm.get('name') as FormControl;
  }
  get email(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }
  get password(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }
  onKeepSigned(): void {
    this.authService.toggleKeepSigned();
  }
  onRememberMe(): void {
    this.authService.toggleRememberMe();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

}
