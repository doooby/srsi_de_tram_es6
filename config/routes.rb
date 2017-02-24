Rails.application.routes.draw do

  root 'pages#home'

  devise_for :users
  resources :users, only: %i[index create]

  scope controller: :pages do
    get 'examples/:example', action: 'examples'
  end

end
