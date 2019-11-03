const { Component } = React;
const { render } = ReactDOM;
const { HashRouter, Switch, Link, Route, Redirect } = ReactRouterDOM;
const root = document.querySelector('#root');


const createProductArr = (offerings, products, companies) => {
    let arr = [];
    products.forEach(product => {
      let obj = {
        id: product.id,
        name: product.name,
        suggestedPrice: product.suggestedPrice,
        offeredPrice: [],
        avgOfferedPrice: 0,
        companyName: [],
        lowestPrice: 0,
        lowestPriceCompany: '',
      };
      offerings.forEach(offering => {
        if (product.id === offering.productId) {
          obj.offeredPrice.push(offering.price);
          companies.forEach(company => {
            if (offering.companyId === company.id) {
              obj.companyName.push(company.name);
            }
          });
        }
      });
      obj.avgOfferedPrice = (obj.offeredPrice.reduce( (total,price)=>{
          total += price; 
          return total;
        },0)/obj.offeredPrice.length).toFixed(2);
      obj.lowestPrice= (obj.offeredPrice.sort( (a,b) => a-b)[0]).toFixed(2);
      obj.lowestPriceCompany = obj.companyName[obj.offeredPrice.indexOf(Number(obj.lowestPrice))];
      arr.push(obj);
    });
    return arr;
  }; //End of createProductArr

const Nav = (props) => {
  const path = props.location.pathname;
  const links = [
    { to: '/', text: 'Home', path: '/'},
    { to: '/products', text: 'Product', path: '/products' },
  ];
  return (
      <div>
        <nav id="main-nav">
            <ul>
            {links.map((link, idx) => {
                return (
                  <li key={idx} className={path === link.path ? 'selected' : ''}><Link to={link.to}>{link.text}</Link></li>
                );
            })}
            </ul>
        </nav>
        <h2>{path === '/' ? 'Home' : path[1].toUpperCase() + path.slice(2)}</h2>
    </div>
  );
};

const Home = props => {
    const{ products, offerings } = props;
  return <div className='home-text theme'>
      <h2>Home</h2>
      <p>We have {products.length} products with an average price of ${(offerings.reduce( (accum, offering) => { accum+= offering.price; return accum}, 0) / offerings.length).toFixed(2)}</p>
  </div>;
};

const Product = props => {   
  const { productArr } = props; 
  console.log(productArr);
  return (
      <ul id='product-list'>
          {productArr.map( product => {
              return <li key={product.id}>
                  <div className='theme'>
                      <p><span>Product: </span>{product.name}</p>
                      <p><span>Suggested Price: </span>${product.suggestedPrice.toFixed(2)}</p>
                      <p><span>Average Price: </span>${product.avgOfferedPrice}</p>
                      <p><span>Lowest Price: </span>${product.lowestPrice} offered by {product.lowestPriceCompany}</p>
                  </div>
              </li>
          })}
      </ul>
    )
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      products: [],
      offerings: [],
      companies: [],
      modifiedProductArr: [],
    };
  }
  async componentDidMount() {
    const products = (await axios.get(
      'https://acme-users-api-rev.herokuapp.com/api/products'
    )).data;
    const offerings = (await axios.get(
      'https://acme-users-api-rev.herokuapp.com/api/offerings'
    )).data;
    const companies = (await axios.get(
      'https://acme-users-api-rev.herokuapp.com/api/companies'
    )).data;
    this.setState({ products, offerings, companies });
    this.setState({modifiedProductArr : createProductArr(this.state.offerings, this.state.products, this.state.companies)});
  }

  render() {
    const { products, offerings, modifiedProductArr } = this.state;
    return (
      <div>
        <h1>Acme Product Averages React</h1>
        <HashRouter>
        <Route render={(props) => (<Nav {...props} />)}/>
          <Switch>
            <Route exact path="/" render={() => (<Home products={products} offerings={offerings}/>)}></Route>
            <Route path="/products"
            render={() => (<Product productArr={modifiedProductArr}/>)}
            ></Route>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}

render(<App />, root);
