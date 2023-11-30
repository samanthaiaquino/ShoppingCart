// simulate getting products from DataBase
const products = [
  { name: 'Apples', country: 'Italy', cost: 3, instock: 10 },
  { name: 'Oranges', country: 'Spain', cost: 4, instock: 3 },
  { name: 'Beans', country: 'USA', cost: 2, instock: 5 },
  { name: 'Cabbage', country: 'USA', cost: 1, instock: 8 },
];

const Cart = (props) => {
  const { Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;

  return <Accordion defaultActiveKey="0">{cartList}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
        }
      }
    };

    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);

  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const { Card, Accordion, Button, Container, Row, Col, Image } = ReactBootstrap;
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('http://localhost:1337/api/products');
  const [{ data, isLoading, isError }, doFetch] = useDataApi('http://localhost:1337/api/products', {
    data: [],
  });

  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name === name);
    setCart([...cart, ...item]);
  };

  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index !== i);
    setCart(newCart);
  };

  const photos = items.map((item, index) => `https://picsum.photos/id/${index + 1000}/${200}/${300}`);

  let list = items.map((item, index) => (
    <li key={index}>
      <Image src={photos[index]} width={100} height={100} rounded></Image>
      <Button variant="success" size="large">
        {item.name}:{item.cost}
      </Button>
      <input name={item.name} type="submit" onClick={addToCart}></input>
    </li>
  ));

  let cartList = cart.map((item, index) => (
    <Accordion.Item key={1 + index} eventKey={1 + index}>
      <Accordion.Header>
        {item.name}
        <Button variant="danger" size="sm" className="ml-2" onClick={() => deleteCartItem(index)}>
          Remove
        </Button>
      </Accordion.Header>
      <Accordion.Body eventKey={1 + index}>
        $ {item.cost} from {item.country}
      </Accordion.Body>
    </Accordion.Item>
  ));

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    return newTotal;
  };

  const restockProducts = (url) => {
    doFetch(url)
      .then((result) => {
        let newItems = result.data.map((item) => {
          let { name, country, cost, instock } = item;
          return { name, country, cost, instock };
        });
        setItems(newItems);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: 'none' }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion defaultActiveKey="0">{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/products${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById('root'));
