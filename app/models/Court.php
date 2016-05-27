<?php

class Court extends \Illuminate\Database\Eloquent\Model
{
    protected $table = 'courts';
    public $timestamps  = false;

    private static $validMaterials = array('HORMIGON', 'CESPED', 'MOQUETA');
    private static $validColors = array('BLUE', 'GREEN', 'BROWN');

    public function getReservas()
    {
        return $this->belongsToMany('\User', 'reservas', 'court_id', 'user_id');
    }

    public static function isValidMaterial($material)
    {
        return in_array($material, Court::$validMaterials);
    }

    public static function isValidColor($color)
    {
        return in_array($color, Court::$validColors);
    }
}