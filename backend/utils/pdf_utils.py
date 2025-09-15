from jinja2 import Environment, FileSystemLoader
import pdfkit
import os
import uuid
import platform
from config import TEMPLATE_DIR, BASE_DIR

# Detect wkhtmltopdf path based on environment
if platform.system() == "Windows":
    WKHTMLTOPDF_PATH = r"D:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
else:
    WKHTMLTOPDF_PATH = "/usr/bin/wkhtmltopdf"

# Configure pdfkit with wkhtmltopdf executable
config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)

# Setup Jinja2 environment
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))
template = env.get_template("catalogue_template.html")

def generate_pdf(shop_name, location, products, primary_color="#000000",
                 secondary_color="#333333", text_color="#000000",
                 background_color="#ffffff", font_family="Arial, sans-serif",
                 layout="row"):

    # Render HTML from template
    html_content = template.render(
        shop_name=shop_name,
        location=location,
        products=products,
        primary_color=primary_color,
        secondary_color=secondary_color,
        text_color=text_color,
        background_color=background_color,
        font_family=font_family,
        layout=layout
    )

    # Save PDF path with random filename
    pdf_path = os.path.join(BASE_DIR, "static", f"catalogue_{uuid.uuid4().hex}.pdf")

    options = {
        'page-size': 'A4',
        'margin-top': '0.5in',
        'margin-right': '0.5in',
        'margin-bottom': '0.5in',
        'margin-left': '0.5in',
        'encoding': "UTF-8",
        'no-outline': None
    }

    try:
        pdfkit.from_string(html_content, pdf_path, options=options, configuration=config)
        return pdf_path
    except Exception as e:
        raise RuntimeError(f"PDF generation failed: {str(e)}")
