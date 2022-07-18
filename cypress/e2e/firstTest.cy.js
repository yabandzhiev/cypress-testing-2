describe("Test with backend", () => {
  beforeEach("login to the app", () => {
    cy.intercept("GET", "**/tags", { fixture: "tags.json" });
    cy.loginToApplication();
  });

  it("verify correct request and response", () => {
    cy.intercept("POST", "**/articles").as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("This is a title4324232");
    cy.get('[formcontrolname="description"]').type("This is a description");
    cy.get('[formcontrolname="body"]').type("This is a body of the Article");
    cy.contains("Publish Article").click();

    cy.wait(1000);
    cy.wait("@postArticles");
    cy.get("@postArticles").then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.request.body.article.body).to.equal(
        "This is a body of the Article"
      );
      expect(xhr.response?.body?.article?.description).to.equal(
        "This is a description"
      );
    });
  });

  it("should give tags", () => {
    cy.get(".tag-list")
      .should("contain", "cypress")
      .and("contain", "automation")
      .and("contain", "testing");
  });

  it("verify gloabl feed likes count", () => {
    cy.intercept("GET", "**/articles/feed*", {
      articles: [],
      articlesCount: 0,
    });
    cy.intercept("GET", "**/articles*", { fixture: "articles.json" });

    cy.contains("Global Feed").click();
    cy.get("app-article-list button").then((listOfButtons) => {
      expect(listOfButtons[0]).to.contain("5");
      expect(listOfButtons[1]).to.contain("3137");

      cy.fixture("articles").then((file) => {
        const articleLink = file.articles[1].slug;
        cy.intercept("POST", "**/articles/" + articleLink + "/favorite", file);
      });

      cy.get("app-article-list button").eq(1).click().should("contain", "3138");
    });
  });

  it("delete a new article in the global feed", () => {
    const bodyRequest = {
      article: {
        tagList: [],
        title: "Request from API12333",
        description: "API testing is easy",
        body: "React is cool",
      },
    };

    cy.get("@token").then((token) => {
      cy.request({
        url: "https://conduit.productionready.io/api/articles",
        headers: {
          Authorization: "Token " + token,
        },
        method: "POST",
        body: bodyRequest,
      }).then((res) => {
        expect(res.status).to.equal(200);
      });

      cy.contains("Global Feed").click();
      cy.get(".article-preview").first().click();
      cy.get(".article-actions").contains("Delete Article").click();

      cy.wait(1000);
      cy.request({
        url: "https://conduit.productionready.io/api/articles?limit=10&offset=0",
        headers: {
          Authorization: "Token " + token,
        },
        method: "GET",
      })
        .its("body")
        .then((body) => {
          console.log(body.articles);

          expect(body.articles[0].title).not.to.equal("Request from API12333");
        });
    });
  });
});
