import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private _authService: AuthService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  login() {
    this._authService.singByGrant().subscribe((res) => {
      const redirectURL =
        this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
        '/market-data';

      // Navigate to the redirect url
      this._router.navigateByUrl(redirectURL);
    });
  }
}
