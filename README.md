# express-bs
```
yarn add express-bs
```

### mock map
```
export default {
  "GET /api/users": function(req, res) {
    let query = req.query || {};
    console.log(query);
    return res.json({
      limit: query.limit,
      offset: query.offset,
      list: [
        {
          username: "admin1",
          sex: 1
        },
        {
          username: "admin2",
          sex: 0
        }
      ]
    });
  },
  "GET /api/users/:id": (req, res) => {
    console.log(req.params);
    return res.json({
      id: req.params.id,
      username: "kenny"
    });
  },
  "POST /api/users": (req, res) => {
    console.log(req.body);
    res.json({ status: "ok", message: "创建成功！" });
  },
  "DELETE /api/users/:id": (req, res) => {
    // console.log(req.params.id);
    res.json({ status: "ok", message: "删除成功！" });
  },
  "PUT /api/users/:id": (req, res) => {
    // console.log(req.params.id);
    // console.log(req.body);
    res.json({ status: "ok", message: "修改成功！" });
  }
};

```

### usage
```
import express from "../../src/main";
import mockData from "../../mock";

const app = express();
app.mock("xhr", mockData);

```