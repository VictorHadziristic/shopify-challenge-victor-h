import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const baseURL= "https://www.omdbapi.com/";

@Injectable({
	providedIn: 'root'
})
export class MovieService {

	constructor(private http:HttpClient) { }

	//Service to contact OMDB API with search term and page number as paramters
	public searchMovieByTitle(searchTerm: string, year:string, page: number): Observable<any> {
		let queryURL = '';
		if(year == ''){
			queryURL = baseURL + "?s=" + searchTerm + "&page=" + page + "&type=movie&apikey=f5ceb891";
		}
		else{
			queryURL = baseURL + "?s=" + searchTerm + "&page=" + page + "&y=" + year + "&type=movie&apikey=f5ceb891";
		}
		return this.http.get(queryURL).pipe(map(res => res));
	}

	public searchMovieById(omdbID: string){
		let queryURL = baseURL + '?i=' + omdbID + "&apikey=f5ceb891";
		return this.http.get(queryURL).pipe(map(res => res));
	}
}