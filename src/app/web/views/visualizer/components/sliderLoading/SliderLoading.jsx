'use client'
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SLIDER_MESSAGES = [
    "⏳ Cargando información...",
    "🌎 Tus terrenos en un solo lugar",
    "⏳ Ahorra tiempo gestionando tus proyectos",
    "🔔 No te pierdas ningún detalle",
    "📤 Visualiza y comparte fácilmente",
    "📄 Toda la información de tu lote al instante",
    "💡 Descubre nuevas oportunidades de inversión",
];

const SliderLoading = ({ info }) => {
    const desc = info?.description || SLIDER_MESSAGES.join('\n');
    const slides = typeof desc === "string"
        ? desc.split('\n').filter(line => line.trim() !== "")
        : Array.isArray(desc)
            ? desc
            : [];

    const settings = {
        className: "center",
        centerMode: true,
        infinite: true,
        centerPadding: "60px",
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        autoplay: true,
        autoplaySpeed: 1200,
    };

    return (
        <div className="slider-container">
            <Slider {...settings}>
                {slides.map((item, index) => (
                    <div key={index} className=" w-[100%] m-[10px] rounded-lg flex justify-center items-center">
                        <h3 className="text-2xl text-center text-black">{item}</h3>
                    </div>
                ))}
            </Slider>
        </div>

    )
}

export default SliderLoading;