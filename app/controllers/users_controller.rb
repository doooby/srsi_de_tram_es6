class UsersController < ApplicationController

  before_action :authenticate_user!
  authorize_resource class: false

  def index
    @users = User.all.order(created_at: :desc)
    @new_user = User.new
  end

  def create
    @new_user = User.new params.require(:user).permit(:email, :password)
    @new_user.save
  end

end
