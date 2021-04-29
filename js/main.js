/*
This code basically works, but it nowhere near complete or fully accurate. It needs a few things to be changed and needs a few things added such as paging. I only had a few hours to think about it and work on it because I was out of town with family until today.

Not requiring users of this code to authenticate on GitHub presents problems with tighter rate limiting and less data returned in the response object. Datapoints such as the number of followers and number of starred repos, for example, are not returned in an unauthenticated request whereas they are in an authenticated request.

The followers and starred counts are incorrect if either number is over 30. This has to do with paging issues in the basic REST API request for users. The default number of records returned is 30 (and the max is 100), so it needs to be refactored. Scraping would eliminate that issue.

After trying a few different approaches and running into request limits, my thinking now is that it may be more efficient to only use the REST API to get user names (and handle paging), then just scrape directly from 'https://github.com/[user name]' for each user to get things like the followers and starred details.

I have run out of time, so I will leave it at that. Thank you for your time!

-Desmond Mullen 4/29/21
*/

const executeFetch = (url) => new Promise((resolve, reject) => {
    try {
        const result = fetch(url)
            .then((response) => response.json())
            .then((data) => data);
        resolve(result);
    } catch (err) {
        reject(new Error(err));
    }
});

const getCount = (url) => new Promise((resolve, reject) => {
    // this can probably be refactored in to the executeFetch function. I'd pass a second parameter of 'true' to executeFetch if I wanted a count of the keys and then return the count (instead of the 'result') in the 'resolve'
    try {
        const result = executeFetch(url)
            .then((data) => Object.keys(data).length);
        resolve(result);
    } catch (err) {
        reject(new Error(err));
    }
});

function showUsers(users) {
    const displayDiv = document.querySelector('#displayDiv');
    users.forEach((user) => {
        getCount(user.followers_url)
            .then((followersCount) => {
                // need to find a better way to count - maxes out at 30 by default, 100 is the max. Need to handle paging.
                getCount(user.starred_url)
                    .then((starredCount) => {
                        // need better count, as above.
                        const userElement = document.createElement('div');
                        userElement.innerHTML = `<a target='_blank' href=${user.avatar_url}><img src=${user.avatar_url} alt=''></a><span class='text'><a target='_blank' href=${user.html_url}>${user.login}</a><br><a target='_blank' href='${user.html_url}?tab=followers'>Followers: ${followersCount}</a><br><a target='_blank' href='${user.html_url}?tab=stars'>Starred: ${starredCount}</a></span>`;
                        displayDiv.append(userElement);
                    });
            });
    });
}

function getUsers() {
    executeFetch('https://api.github.com/users')
        .then((result) => {
            console.log(result);
            showUsers(result);
        });
}

getUsers();
