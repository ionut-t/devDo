import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from './must-match.validator';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { UIService } from 'src/app/shared/ui.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  signupForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  private loadingSubscription: Subscription;
  private authStatusSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private uiService: UIService
  ) {}

  /**
   * Create and validate the reactive sign up form.
   */
  ngOnInit() {
    this.authStatusSubscription = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false;
      });
    this.signupForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      },
      {
        validator: MustMatch('password', 'confirmPassword')
      }
    );
  }

  /**
   *  Getter for easy access to form fields.
   */
  get form() {
    return this.signupForm.controls;
  }

  /**
   * Handle sign up form errors -> email field.
   */
  emailErrorHandler() {
    if (this.form.email.hasError('required')) {
      return 'You must enter a valid email';
    } else if (this.form.email.hasError('email')) {
      return 'This is not a valid email';
    }
    return null;
  }

  /**
   * Handle sign up form errors -> password field.
   */
  passwordErrorHandler() {
    if (this.form.password.hasError('required')) {
      return 'You must enter a password';
    } else if (this.form.password.hasError('minlength')) {
      return 'The password is too short. Please enter minimum 6 characters';
    }
    return null;
  }

  /**
   * Handle sign up form errors -> confirm-password field.
   */
  confirmPasswordErrorHandler() {
    if (this.form.confirmPassword.hasError('required')) {
      return 'You must confirm your password';
    } else if (this.form.confirmPassword.hasError('mustMatch')) {
      return 'Passwords do not match';
    }
    return null;
  }

  /**
   * Call create user
   */
  onSubmit() {
    this.loadingSubscription = this.uiService.loadingStateChanged.subscribe(
      isLoading => (this.isLoading = isLoading)
    );
    this.authService.createUser(
      this.form.email.value,
      this.form.password.value
    );
  }

  /**
   * Unsubscribe from subscriptions
   */
  ngOnDestroy() {
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }

    if (this.authStatusSubscription) {
      this.authStatusSubscription.unsubscribe();
    }
  }
}
