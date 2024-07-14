import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: 'passward',
  port: 5432
});


db.connect();

async function checkVisisted() {

  const result = await db.query("SELECT * FROM visited_countries");

  let visitedCountries=[];

  for(let i = 0;i<result.rows.length ; i++){
    visitedCountries.push(result.rows[i].country_code)
  }
  console.log(visitedCountries);
    

  return visitedCountries;

}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  const visitedCountries = await checkVisisted();

  res.render('index.ejs',{total: visitedCountries.length, countries:visitedCountries});
});

app.post("/add", async(req,res)=>{
  let addcountryName = req.body.country;
  let addcountryCode;

  try {
      console.log(addcountryName.toLowerCase());

      const result = await db.query(
        "SELECT country_code FROM country WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
        [addcountryName.toLowerCase()]
      );

    addcountryCode = result.rows[0].country_code;
    try {
      await db.query("INSERT INTO visited_countries(country_code) VALUES($1)",
        [addcountryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }



});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
