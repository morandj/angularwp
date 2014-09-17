var DemoApp = angular.module('DemoApp', ['ngRoute', 'ngAnimate', 'ngResource', 'ngSanitize'])

/**
 *
 *	Configure our app
 *
 */
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
{
	/**
	 *	Configure routes
	 */
    $routeProvider
    .when('/', {
    	title: 'Welcome',
        templateUrl: '/partials/index.html',
        controller: 'GetPage'
    })
    .when('/about', {
    	title: 'About Site',
    	templateUrl: '/partials/page.html',
    	controller: 'GetPage'
    })
    .when('/services', {
    	title: 'Our Services',
    	templateUrl: '/partials/page.html',
    	controller: 'GetPage'
    })
    .when('/blog', {
        title: 'Read Our Blog',
        templateUrl: '/partials/blog.html',
        controller: 'BlogList'
    })
    .when('/blog/page/:page', {
        title: 'Read Our Blog',
        templateUrl: '/partials/blog.html',
        controller: 'BlogList'
    })
    .when('/blog/:category', {
        title: '',
        templateUrl: '/partials/blog.html',
        controller: 'BlogList'
    })
    .when('/blog/:category/:post', {
        title: '',
        templateUrl: '/partials/post.html',
        controller: 'BlogPost'
    });

    /**
     *	Remove # from the URL with $locationProvider
     */
    //$locationProvider.html5Mode(true);
}])

/**
 *
 *	On runtime define the page titles for injecting into the page <title> tag
 *
 */
.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}])

.controller('MenuController', function($scope, $location){
    $scope.isActive = function(route) {
       return route === $location.url();
    }
})

/**
 *
 *	Set up a controller called GetPage which is referenced by the
 *	routing set up above. We are passing a URL (using $location.url()) 
 *	to the API in order to retrieve information for the specific page
 *
 */
.controller('GetPage', function($scope, $http, $location){

	/**
	 *	Perform a GET request on the API and pass the slug to it using $location.url()
	 *	On success, pass the data to the view through $scope.page
	 */
	$http.get('/wordpress/api/get_page/?slug=' + $location.url())
    .success(function(data, status, headers, config){
        $scope.page = data.page;
    })
    .error(function(data, status, headers, config){
        window.alert("We have been unable to access the feed :-(");
    })

})

.controller('BlogList', function($scope, $http, $routeParams){

    /** 
     *  Get the parameter passed into the controller (if it exists)
     *  and then construct the GET URL. If parameter exists, the user
     *  is looking at a specific category.
     */
    if($routeParams.category)
    {
        /**
         *  Get posts from a specific category by passing in the slug
         */
        var url = $http.get('/wordpress/api/get_category_posts/?slug=' + $routeParams.category); 
    }
    else
    {
        if($routeParams.page)
        {
            /**
             *  If a page parameter has been passed, send this to the API
             */
            var url = $http.get('/wordpress/api/get_posts/?page=' + $routeParams.page);
        }
        else
        {
            /**
             *  If no parameter supplied, just get all posts
             */
            var url = $http.get('/wordpress/api/get_posts');

            // Set a default paging value
            $scope.page = 1;
            // Set a default next value
            $scope.next = 2;
        }
    }
    url
    .success(function(data, status, headers, config){
        /**
         *  Pass data from the feed to the view.
         *  $scope.posts will pass exclusively post data
         *  $scope.paging will pass the whole feed and will be used to work out paging
         */
        $scope.posts = data.posts;
        $scope.paging = data;

        if($routeParams.page)
        {
            // Get current page
            $scope.page = $routeParams.page;
            // Caluculate next/previous values
            $scope.next = parseInt($routeParams.page)+1;
            $scope.prev = parseInt($routeParams.page)-1;
        }
    })
    .error(function(data, status, headers, config){
        window.alert("We have been unable to access the feed :-(");
    })

})

.controller('BlogPost', function($scope, $http, $routeParams){

    /**
     *  Call the get_post method from the API and pass to it the 
     *  value of $routeParams.post, which is actually the post slug
     */
    $http.get('/wordpress/api/get_post/?slug=' + $routeParams.post)
    .success(function(data, status, headers, config){
        $scope.post = data;
        $scope.comments = data.post.comments;
    })
    .error(function(data, status, headers, config){
        window.alert("We have been unable to access the feed :-(");
    })

})

.controller('CategoryList', function($scope, $http){

    /**
     *  This method just gets the categories available to us and 
     *  makes them available through CategoryList controller
     */
    $http.get('/wordpress/api/get_category_index')
    .success(function(data, status, headers, config){
        $scope.categories = data.categories;
    })
    .error(function(data, status, headers, config){
        window.alert("We have been unable to access the feed :-(");
    })

})