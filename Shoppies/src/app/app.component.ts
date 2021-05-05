import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MovieService } from './movie.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

	movies = [];
	nominated = [];
	nominatedIDs = [];
	noOfPages = 0;
	noOfResults = 0;
	currentPage = 1;
	pageOptions = [];
	amountNominated = 0;
	searchError = '';

	searchTerm = '';
	searchYear = '';

	linkGenerated = false;

	title = 'The Shoppies';

	constructor(private omdbAPI: MovieService, private activatedRoute: ActivatedRoute, private cookieService: CookieService){ }

	ngOnInit(): void {
		//load from cookie
		this.loadFromCookie();

		//Check whether url code exits, then load nominated movies
		this.activatedRoute.queryParams.subscribe(params => {
			let session = params['session'];
			if(session != null){
				this.nominated = [];
				this.nominatedIDs = [];
				this.amountNominated = 0;
				let sessionMovies = JSON.parse(atob(session));
				for(let movie of sessionMovies){
					this.omdbAPI.searchMovieById(movie).subscribe(res => {
						this.nominated.push(res);
						this.amountNominated++;
					});
				}
				this.persistToCookie();
			}
		});
	}

	search(searchTerm, searchYear, page){
		this.searchError = '';
		if(searchTerm != ''){
			this.omdbAPI.searchMovieByTitle(searchTerm, searchYear, page).subscribe(res => {
				this.movies = res.Search;
				this.noOfPages = Math.floor(res.totalResults / 10);
				if(res.totalResults != null){
					if(res.totalResults % 10 != 0){ this.noOfPages++;}
					this.noOfResults = res.totalResults;
				}else{
					this.searchError = res.Error;
				}
			});
		}
	}

	nominateMovie(movie){
		if(this.amountNominated < 5){
			movie.selected = true;
			this.nominatedIDs.push(movie.imdbID);
			this.nominated.push(movie);
			this.amountNominated++;
		}
		if(this.amountNominated == 5){
			alert("Congratulations! You have selected all 5 of your nominations!");
		}
		this.persistToCookie();
	}

	denominateMovie(movie){
		if(this.amountNominated > 0){
			movie.selected = false;
			this.nominated = this.nominated.filter(function(obj){
				return obj.imdbID !== movie.imdbID;
			});
			this.nominatedIDs = this.nominatedIDs.filter(function(obj){
				return obj !== movie.imdbID;
			});
			this.amountNominated--;
			this.persistToCookie(); 
		}
	}

	pageCounter(i :number){
		return new Array(i);
	}

	copyLink(){
		let baseURL = "https://victorhadziristic.github.io/shoppies-deployment/?session=";
		const copyValue = document.createElement('textarea');
		copyValue.style.position = 'fixed';
		copyValue.style.left = '0';
		copyValue.style.top = '0';
		copyValue.style.opacity = '0';
		copyValue.value = baseURL + btoa(JSON.stringify(this.nominatedIDs));
		document.body.appendChild(copyValue);
		copyValue.focus();
		copyValue.select();
		document.execCommand('copy');
		document.body.removeChild(copyValue);
		this.linkGenerated = true;
	}

	persistToCookie(){
		this.cookieService.set('nominated', JSON.stringify(this.nominated));
		this.cookieService.set('nominatedIDs', JSON.stringify(this.nominatedIDs));
		this.cookieService.set('amountNominated', this.amountNominated.toString());
	}

	loadFromCookie(){
		if(this.nominated != null && this.nominatedIDs != null && this.amountNominated != null){
			this.nominated = JSON.parse(this.cookieService.get('nominated'));
			this.nominatedIDs = JSON.parse(this.cookieService.get('nominatedIDs'));
			this.amountNominated = Number.parseInt(this.cookieService.get('amountNominated'));
		}
	}
}