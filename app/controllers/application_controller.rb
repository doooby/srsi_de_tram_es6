class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  rescue_from CanCan::AccessDenied do |exception|
    respond_to do |format|
      format.html { html_access_denied exception }
      format.any  { head :forbidden, content_type: 'text/html' }
    end
  end

  protected

  def html_access_denied _
    head :forbidden, content_type: 'text/html'
  end

end
