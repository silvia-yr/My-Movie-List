// 定義需要使用的URL-->follow restful原則
const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
//使用 const 代表不能用 movies = response.data.results 這種簡單的等號賦值來把資料放進變數裡，需要用 movies.push() 的方式把資料放進去
//參考【By Value v.s. By Reference】
const movies = [] //要放置80筆movie資料的陣列
const dataPanel = document.querySelector('#data-panel') //選出要渲染的id:data-panel
const searchForm = document.querySelector('#search-form') //綁搜尋按鈕的監聽器
const searchInput = document.querySelector('#search-input') //抓取搜尋輸入文字
const MOVIES_PER_PAGE = 12  //分頁器，一頁12個元素
const paginator = document.querySelector('#paginator') //製作分頁器
let filteredMovies = [] //放入查找後篩出的電影清單，為了讓搜尋功能添加分頁器，要將filterMovies設為全域變數

//這裡用data不用movie的原因是未來如果需要擷取不同資料時不需要大幅修改函式-->稱為降低耦合性，「耦合 (coupling)」是指「和其他程式碼有關係」，一支函式若要用到愈多外部資料，那它的耦合性就愈高，反之，一支函式愈「獨立」，它的耦合性就愈低。而「低耦合性」是品質良好的程式碼的指標之一，通常表示可讀性及可維護性會比較好
//data是一個參數，預計放入陣列元素，像是movies的資料
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    //item會帶入每一筆movies資料
    // title, image
    //28行使用data-set item.id將id資訊綁入more的按鈕中
    //32行使用data-set item.id將id資訊綁入+的按鈕中
    console.log(item)
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}
//動態渲染每一頁要呈現的電影內容
function renderPaginator(amount) {
  // 計算所需的全部頁數
  // 利用math.ceil無條件進位
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 渲染每一頁的元素
  // 在<a>標籤加上 data-page 屬性來標注頁數，方便後續取用頁碼
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML

}

// showMovieModal函式需要傳入電影的 id 參數，將axios發送的request結果輸出至modal
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}
//addToFavorite函式
function addToFavorite(id) {
  //console.log(id)
  console.log(id) // 追蹤呼叫
  //補充JSON.stringify()-->存入local storage時轉換成 Json格式
  //補充JSON.parse()-->取出資料時，轉換回JS格式
  //list：電影收藏清單
  //參考邏輯運算子，如果兩邊都是 true以左邊為優先(也就是favoriteMovies)
  //空陣列是因為一開始local storage是空的，應該設置為空陣列
  //那為何一開始不設定const list = []?
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  //movie:要收藏的電影
  //用find去比對電影清單movies，只要和收藏清單的id相同就放到movie變數裡
  //find 在找到第一個符合條件的 item 後就會停下來回傳該 item
  const movie = movies.find((movie) => movie.id === id)
  //錯誤處理：重複加入 
  //some:「陣列裡有沒有 item 通過檢查條件」，有的話回傳 true ，到最後都沒有就回傳 false
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
  // console.log('Movie added to favorites:', movie) // 確認電影已加入收藏清單
}
// 製作分頁器
// startIndex=0,12,24,....
// slice() 結尾的 index 並不會包含在新陣列中
function getMoviesByPage(page) {
  //條件(三元)運算子-條件 ? 值1 : 值2，如果 條件 為 true，運算子回傳 值 1， 否則回傳 值 2
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)

}

// 設置監聽器 @data panel
// 在more按鈕上設置條件
// 在＋按鈕上設置條件
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset.id)  //用dataset調用綁定的電影id資訊
    showMovieModal(event.target.dataset.id) //將API放入modal
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})
//為何監聽器不能用click?
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault() //預防瀏覽器的預設行為-->跳轉頁面或重新整理
  //console.log('click')
  //使用searchInput.value提取輸入搜尋關鍵字，trim可以去掉前後空格，toLowerCase是將所有字母轉為小寫以利對比
  //alert:如果沒有輸入內容就按下search會出現錯誤警示
  const keyword = searchInput.value.trim().toLowerCase()
  //let filteredMovies = [] //放入查找後篩出的電影清單，為了讓搜尋功能添加分頁器，要將filterMovies設為全域變數
  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  //篩選出搜尋的電影清單並顯示
  //方法1:for迴圈s
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  //方法2:用filter陣列操作方式---filter需要的參數是一個條件函式，只有通過這個條件函式檢查的項目，才會被 filter 保留並回傳一個新的陣列
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //優化使用者體驗：錯誤處理
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //讓搜尋清單的內容也可以分頁
  renderPaginator(filteredMovies.length)
  //預設顯示第一頁的搜尋結果
  renderMovieList(getMoviesByPage(1))

})
// Pagination 標籤的事件監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})


axios
  .get(INDEX_URL) //取得電影資料
  .then((response) => {
    //有80個元素的陣列
    // console.log(response.data.results)
    //...是展開運算子，主要功用是「展開陣列元素」
    //沒有用...的話會產生一個大陣列裡面包著80筆資料的陣列（多一層）（因為movies.push()本身就會產生一個陣列
    //方法1:for(const movie of response.data.results){movies.push(movie)}
    //思考-->可以用for Each嗎？？
    //方法2如下
    movies.push(...response.data.results)
    console.log(movies)
    //renderMovieList(movies) //使用movies陣列調用renderMovieList函式
    renderPaginator(movies.length) //渲染出所有頁碼(7頁)
    renderMovieList(getMoviesByPage(1)) //優先呈現第一頁

  })
  .catch((err) => console.log(err))